const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de categorías y búsqueda (tarjeta B). Es la única capa que habla con Prisma.

// Valores permitidos de sort → orden de Prisma
const SORTS = {
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name: { title: "asc" },
};

// Entero >= 1 con valor por defecto y tope opcional (para page y limit)
const toInt = (value, def, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return max ? Math.min(n, max) : n;
};

// Precio opcional del query: número >= 0, si no → 400
const parsePrice = (value, name) => {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (value === "" || !Number.isFinite(n) || n < 0)
    throw new HttpError(400, `${name} debe ser un número mayor o igual a 0`);
  return n;
};

// Datos que se muestran de cada categoría dentro de un libro
const categorySelect = { select: { id: true, name: true } };

// POST /api/categories → crea la categoría. Nombre repetido → P2002 → errorHandler responde 409
const create = async ({ name, description, aisle } = {}) => {
  if (typeof name !== "string" || name.trim().length === 0)
    throw new HttpError(400, "El nombre de la categoría es obligatorio");
  if (name.trim().length > 80)
    throw new HttpError(400, "El nombre no puede pasar de 80 caracteres");

  return prisma.category.create({
    data: {
      name: name.trim(),
      description: typeof description === "string" ? description : undefined,
      aisle: typeof aisle === "string" && aisle.trim() ? aisle.trim() : "General", // aisle es obligatorio en el schema
    },
  });
};

// GET /api/categories → lista con el número de libros de cada una (_count)
const list = () =>
  prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { books: true } } },
  });

// PUT /api/books/:id/categories → reemplaza TODAS las categorías del libro (set)
const setBookCategories = async (bookId, categoryIds) => {
  if (!Array.isArray(categoryIds) || !categoryIds.every((id) => Number.isInteger(id)))
    throw new HttpError(400, "categoryIds debe ser un arreglo de enteros");

  const ids = [...new Set(categoryIds)]; // sin repetidos

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new HttpError(404, "Libro no encontrado");

  const found = await prisma.category.count({ where: { id: { in: ids } } });
  if (found !== ids.length) throw new HttpError(404, "Alguna de las categorías no existe");

  return prisma.book.update({
    where: { id: bookId },
    data: { categories: { set: ids.map((id) => ({ id })) } }, // set: quita las anteriores y deja solo estas
    include: { categories: categorySelect },
  });
};

// GET /api/books/search?q&category&min&max&sort&page&limit → filtros combinables, orden y paginación
const search = async ({ q, category, min, max, sort, page, limit } = {}) => {
  if (sort !== undefined && !SORTS[sort])
    throw new HttpError(400, `sort debe ser uno de: ${Object.keys(SORTS).join(", ")}`);

  const minPrice = parsePrice(min, "min");
  const maxPrice = parsePrice(max, "max");
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    throw new HttpError(400, "min no puede ser mayor que max");

  const text = typeof q === "string" ? q.trim() : "";
  const categoryName = typeof category === "string" ? category.trim() : "";

  // Cada filtro solo se agrega si llegó: así se pueden combinar libremente
  const where = {
    ...(text && { title: { contains: text, mode: "insensitive" } }), // sin distinguir mayúsculas
    ...(categoryName && {
      categories: { some: { name: { equals: categoryName, mode: "insensitive" } } }, // N:M con some
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: { gte: minPrice, lte: maxPrice },
    }),
  };

  const take = toInt(limit, 10, 50);
  const currentPage = toInt(page, 1);
  const skip = (currentPage - 1) * take;

  // Conteo y página en una sola transacción de lectura
  const [total, data] = await prisma.$transaction([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      include: { categories: categorySelect },
      orderBy: SORTS[sort] ?? { id: "asc" },
      skip,
      take,
    }),
  ]);

  return { page: currentPage, limit: take, total, pages: Math.ceil(total / take), data };
};

// RETO · GET /api/categories/:id/products → libros de una categoría, paginados
const booksByCategory = async (categoryId, { page, limit } = {}) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new HttpError(404, "Categoría no encontrada");

  const where = { categories: { some: { id: categoryId } } };
  const take = toInt(limit, 10, 50);
  const currentPage = toInt(page, 1);

  const [total, data] = await prisma.$transaction([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (currentPage - 1) * take,
      take,
    }),
  ]);

  return {
    category: { id: category.id, name: category.name },
    page: currentPage,
    limit: take,
    total,
    pages: Math.ceil(total / take),
    data,
  };
};

module.exports = { create, list, setBookCategories, search, booksByCategory };
