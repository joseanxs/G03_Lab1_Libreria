const { OrderStatus } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// ADMIN SERVICE: consultas y acciones que solo hace el administrador

const toInt = (value, def, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return max ? Math.min(n, max) : n;
};

const parseStatus = (status) => {
  if (status === undefined) return undefined;
  if (!Object.values(OrderStatus).includes(status))
    throw new HttpError(400, `status debe ser uno de: ${Object.values(OrderStatus).join(", ")}`);
  return status;
};

const parseDate = (value, name) => {
  if (value === undefined) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, `${name} no es una fecha válida (usa AAAA-MM-DD)`);
  return d;
};

// Filtros + paginación + orden + conteo en una sola transacción de lectura
const listOrders = async ({ status, from, to, page, limit }) => {
  const fromDate = parseDate(from, "from");
  const toDate = parseDate(to, "to");
  // Si "to" llega como AAAA-MM-DD, incluye todo ese día
  if (toDate && /^\d{4}-\d{2}-\d{2}$/.test(to)) toDate.setUTCHours(23, 59, 59, 999);

  const where = {
    status: parseStatus(status),
    ...((fromDate || toDate) && { createdAt: { gte: fromDate, lte: toDate } }),
  };

  const take = toInt(limit, 10, 50);
  const currentPage = toInt(page, 1);
  const skip = (currentPage - 1) * take;

  const [total, data] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, fullName: true, email: true } },
        items: { include: { book: { select: { id: true, title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return { page: currentPage, limit: take, total, pages: Math.ceil(total / take), data };
};

const TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const updateOrderStatus = async (adminId, id, status, note) => {
  if (status === undefined) throw new HttpError(400, "Envía el nuevo status");
  parseStatus(status);
  if (note !== undefined && (typeof note !== "string" || note.length > 200))
    throw new HttpError(400, "note debe ser texto de máximo 200 caracteres");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new HttpError(404, "Pedido no encontrado");

    if (!TRANSITIONS[order.status].includes(status))
      throw new HttpError(409, `Transición no permitida: ${order.status} → ${status}`);

    // Condicionado al estado actual: si otro admin lo cambió mientras tanto, count = 0
    const { count } = await tx.order.updateMany({
      where: { id, status: order.status },
      data: { status },
    });
    if (count === 0) throw new HttpError(409, "El pedido cambió mientras tanto; vuelve a consultarlo");

    if (status === "CANCELLED") {
      for (const { bookId, quantity } of order.items) {
        await tx.book.update({ where: { id: bookId }, data: { stock: { increment: quantity } } });
      }
    }

    await tx.orderStatusHistory.create({
      data: { orderId: id, fromStatus: order.status, toStatus: status, note, changedById: adminId },
    });

    return tx.order.findUnique({
      where: { id },
      include: { items: { include: { book: { select: { id: true, title: true } } } } },
    });
  });
};

// Consulta avanzada: agrupa los ítems por libro y suma unidades vendidas (sin pedidos cancelados)
const topBooks = async (limit) => {
  const grouped = await prisma.orderItem.groupBy({
    by: ["bookId"],
    _sum: { quantity: true },
    where: { order: { status: { not: "CANCELLED" } } },
    orderBy: { _sum: { quantity: "desc" } },
    take: toInt(limit, 5, 20),
  });

  const books = await prisma.book.findMany({
    where: { id: { in: grouped.map((g) => g.bookId) } },
    select: { id: true, title: true },
  });
  const titleOf = new Map(books.map((b) => [b.id, b.title]));

  return grouped.map((g) => ({ bookId: g.bookId, title: titleOf.get(g.bookId), unitsSold: g._sum.quantity }));
};

module.exports = { listOrders, updateOrderStatus, topBooks };
