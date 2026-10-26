const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de pedidos: el recurso limitado es el stock del libro

// Cómo se devuelve un pedido: con sus ítems y el título del libro
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
    if (!Number.isInteger(it.bookId) || !Number.isInteger(it.quantity) || it.quantity < 1)
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

      // Descuenta solo si alcanza: dos pedidos simultáneos no venden la misma unidad
      const { count } = await tx.book.updateMany({
        where: { id: bookId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) throw new HttpError(409, `Stock insuficiente para "${book.title}"`);
      total = total.add(book.price.mul(quantity));
      lines.push({ bookId, quantity, unitPrice: book.price });
    }

    return tx.order.create({
      data: { customerId: customer.id, total, items: { create: lines } },
      include: orderInclude,
    }); // → COMMIT
  });
};

const listByUser = async (userId) => {
  const customer = await customerOf(userId);
  return prisma.order.findMany({
    where: { customerId: customer.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

// TRANSACCIÓN: cambia el estado y devuelve el stock de cada ítem
const cancel = async (userId, orderId) => {
  const customer = await customerOf(userId);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new HttpError(404, "Pedido no encontrado");
    if (order.customerId !== customer.id) throw new HttpError(403, "Este pedido no es tuyo");
    if (order.status !== "PENDING") throw new HttpError(409, "Solo se puede cancelar un pedido pendiente");

    // Devuelve el stock de cada ítem
    for (const { bookId, quantity } of order.items) {
      await tx.book.update({ where: { id: bookId }, data: { stock: { increment: quantity } } });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: orderInclude,
    });
  });
};

module.exports = { create, listByUser, cancel };
