const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const reviewSelect = {
    id: true,
    rating: true,
    comment: true,
    createdAt: true,
    userId: true,
    bookId: true,
};

const toInt = (value, def, max) => {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n) || n < 1) return def;
    return max ? Math.min(n, max) : n;
};

const validate = ({ rating, comment }) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        throw new HttpError(400, "rating debe ser un entero de 1 a 5");
    if (comment === undefined || comment === null) return null;
    if (typeof comment !== "string") throw new HttpError(400, "comment debe ser un texto");
    const text = comment.trim();
    if (text.length > 300) throw new HttpError(400, "comment no puede superar los 300 caracteres");
    return text || null;
};

const ensureBook = async (bookId) => {
    const book = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true } });
    if (!book) throw new HttpError(404, "Libro no encontrado");
};

const create = async (userId, bookId, body) => {
    const comment = validate(body);
    await ensureBook(bookId);
    try {
        return await prisma.review.create({
            data: { rating: body.rating, comment, userId, bookId },
            select: reviewSelect,
        });
    } catch (err) {
        // @@unique([userId, bookId]): si dos peticiones llegan a la vez, la base rechaza la segunda
        if (err.code === "P2002") throw new HttpError(409, "Ya reseñaste este libro");
        throw err;
    }
};

const listByBook = async (bookId, { page, limit } = {}) => {
    await ensureBook(bookId);

    const take = toInt(limit, 10, 50);
    const currentPage = toInt(page, 1);

    // Una sola transacción de lectura: el promedio, el total y la página salen del mismo momento
    const [stats, data] = await prisma.$transaction([
        prisma.review.aggregate({
            where: { bookId },
            _avg: { rating: true },
            _count: { _all: true },
        }),
        prisma.review.findMany({
            where: { bookId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }], // más recientes primero
            skip: (currentPage - 1) * take,
            take,
            select: { ...reviewSelect, user: { select: { name: true } } }, // nunca el correo ni la contraseña
        }),
    ]);

    const total = stats._count._all;
    const average = stats._avg.rating === null ? null : Math.round(stats._avg.rating * 100) / 100;
    return { bookId, average, total, page: currentPage, limit: take, pages: Math.ceil(total / take), data };
};

const remove = async ({ id: userId, role }, reviewId) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { id: true, userId: true },
    });
    if (!review) throw new HttpError(404, "Reseña no encontrada");
    if (review.userId !== userId && role !== "ADMIN")
        throw new HttpError(403, "No puedes eliminar la reseña de otro usuario");
    await prisma.review.delete({ where: { id: reviewId } });
};

module.exports = { create, listByBook, remove };
