const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de pedidos: el recurso limitado es el stock del libro

// Cómo se devuelve un pedido: con sus ítems y el título del libro (fetch explícito)
const orderInclude = {
  items: { include: { book: { select: { id: true, title: true } } } },
};

const customerOf = async (userId) => {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) throw new HttpError(403, "El usuario no tiene perfil de cliente");
  return customer;
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0)
    throw new HttpError(400, "items debe ser un arreglo con al menos un libro");
  for (const [i, it] of items.entries()) {
    if (!Number.isInteger(it?.bookId) || !Number.isInteger(it?.quantity) || it.quantity < 1)
      throw new HttpError(400, `Ítem ${i + 1}: bookId y quantity deben ser enteros y quantity >= 1`);
  }
  if (new Set(items.map((it) => it.bookId)).size !== items.length)
    throw new HttpError(400, "No repitas el mismo libro: suma las cantidades");
};

// TRANSACCIÓN: descuenta stock y crea el pedido con sus ítems, o no hace nada (ROLLBACK)
const create = async (userId, items) => {
  validateItems(items);
  const customer = await customerOf(userId);

  return prisma.$transaction(async (tx) => {
    let total = new Prisma.Decimal(0);
    const lines = [];

    for (const { bookId, quantity } of items) {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) throw new HttpError(404, `El libro ${bookId} no existe`);
      if (!book.available) throw new HttpError(409, `"${book.title}" no está disponible`);

      // Actualización condicional: solo descuenta si alcanza. Dos pedidos simultáneos
      // por la última unidad no pueden ganar los dos (el segundo obtiene count = 0).
      const { count } = await tx.book.updateMany({
        where: { id: bookId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) throw new HttpError(409, `Stock insuficiente para "${book.title}"`); // → ROLLBACK

      total = total.add(new Prisma.Decimal(book.price).mul(quantity));
      lines.push({ bookId, quantity, unitPrice: book.price });
    }

    return tx.order.create({
      data: { customerId: customer.id, total, items: { create: lines } },
      include: orderInclude,
    }); // → COMMIT
  });
};

// Pedidos del usuario autenticado, con ítems y libro, del más reciente al más antiguo
const listByUser = async (userId) => {
  const customer = await customerOf(userId);
  return prisma.order.findMany({
    where: { customerId: customer.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

// TRANSACCIÓN: cambia el estado y devuelve el stock de cada ítem
// 404 si no existe, 403 si no es del usuario, 409 si ya no está PENDING
const cancel = async (userId, orderId) => {
  const customer = await customerOf(userId);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new HttpError(404, "Pedido no encontrado");
    if (order.customerId !== customer.id) throw new HttpError(403, "Este pedido no es tuyo");

    // Cambio de estado condicional: si dos cancelaciones llegan a la vez, solo una
    // encuentra el pedido en PENDING; la otra obtiene count = 0 y el stock no se devuelve dos veces.
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (count === 0) throw new HttpError(409, "Solo se puede cancelar un pedido pendiente");

    for (const { bookId, quantity } of order.items) {
      await tx.book.update({ where: { id: bookId }, data: { stock: { increment: quantity } } });
    }

    return tx.order.findUnique({ where: { id: orderId }, include: orderInclude });
  });
};

module.exports = { create, listByUser, cancel };
