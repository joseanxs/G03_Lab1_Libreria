const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const list = () => prisma.book.findMany({ orderBy: { id: "asc" } });

const FIELDS = ["title", "author", "price", "available", "stock"];

const normalize = (data) => {
  const body = { ...data };
  if (body.name !== undefined && body.title === undefined) body.title = body.name;
  if (body.Author !== undefined && body.author === undefined) body.author = body.Author;
  return body;
};

const pick = (data) =>
  Object.fromEntries(FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));

const validate = (data, { partial = false } = {}) => {
  const llega = (campo) => data[campo] !== undefined;

  // Título
  const title = data.title !== undefined ? data.title : data.name;
  if (!partial || llega("title")) {
    if (typeof title !== "string" || title.trim().length < 2) {
      return "El título del libro debe tener al menos 2 caracteres";
    }
  }

  // Precio mayor a 0 y numérico
  if (!partial || llega("price")) {
    if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0) {
      return "El precio debe ser un número mayor a 0";
    }
  }

  // Autor
  const author = data.Author !== undefined ? data.Author : data.author;
  if (llega("author")) {
    if (typeof author !== "string" || author.trim().length < 2) {
      return "El autor debe tener al menos 2 caracteres";
    }
  }

  // Stock mayor o igual a 0 si se envía
  if (llega("stock")) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      return "El stock debe ser un número entero mayor o igual a 0";
    }
  }

  // Disponibilidad
  if (llega("available")) {
    if (typeof data.available !== "boolean") {
      return "La disponibilidad debe ser true o false";
    }
  }

  // Las categorías (N:M) ya no se validan aquí: se asignan con PUT /api/books/:id/categories

  return null;
};

const getById = async (id) => {
  const item = await prisma.book.findUnique({ where: { id } });
  if (!item) throw new HttpError(404, "Libro no encontrado");
  return item;
};

const create = async (data) => {
  const body = normalize(data);
  const error = validate(body, { partial: false });
  if (error) throw new HttpError(400, error);
  return prisma.book.create({ data: pick(body) });
};

const update = async (id, data) => {
  const body = normalize(data);
  const error = validate(body, { partial: true });
  if (error) throw new HttpError(400, error);
  await getById(id); // 404 si no existe
  return prisma.book.update({ where: { id }, data: pick(body) });
};

const remove = async (id) => {
  const { count } = await prisma.book.deleteMany({ where: { id } });
  if (count === 0) throw new HttpError(404, "Libro no encontrado");
};

const removeAll = async () => {
  await prisma.book.deleteMany();
};

const createMany = (items) =>
  prisma.$transaction(async (tx) => {
    const created = [];
    for (const [i, item] of items.entries()) {
      const body = normalize(item ?? {});
      const error = validate(body, { partial: false });
      if (error) throw new HttpError(400, `Ítem ${i + 1}: ${error}`);
      created.push(await tx.book.create({ data: pick(body) }));
    }
    return created;
  });

module.exports = { list, getById, create, update, remove, removeAll, createMany };