const book = require("../models/book.model");
const HttpError = require("../utils/httpError");

// SERVICIO: reglas de negocio y acceso a datos a través del modelo.
// Lanza HttpError (400, 404) cuando una regla no se cumple. En el Lab 2 este archivo
// usará Prisma; el controlador y las rutas no cambian.

// Devuelve un mensaje de error o null si los datos son válidos.
// partial = true en PUT: valida solo los campos que llegan.
// TODO Paso 1: al menos 2 validaciones de TU entidad.
const validate = (data, { partial = false } = {}) => {
  const llega = (campo) => data[campo] !== undefined;

  // Título (acepta title o name si se envía como fallback)
  const title = data.title !== undefined ? data.title : data.name;
  if (!partial || llega("title")) {
    if (typeof title !== "string" || title.trim().length < 2) {
      return "El título del libro debe tener al menos 2 caracteres";
    }
  }

  // Precio: mayor a 0 y numérico
  if (!partial || llega("price")) {
    if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0) {
      return "El precio debe ser un número mayor a 0";
    }
  }

  // Autor: al menos 2 caracteres si se envía
  const author = data.Author !== undefined ? data.Author : data.author;
  if (llega("author")) {
    if (typeof author !== "string" || author.trim().length < 2) {
      return "El autor debe tener al menos 2 caracteres";
    }
  }

  // Stock: mayor o igual a 0 si se envía
  if (llega("stock")) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      return "El stock debe ser un número entero mayor o igual a 0";
    }
  }

  // Disponibilidad: booleano si se envía
  if (llega("available")) {
    if (typeof data.available !== "boolean") {
      return "La disponibilidad debe ser un valor booleano";
    }
  }

  return null;
};

// ✅ Ya resuelto: úsalo como guía
const list = () => book.readAll();

// ✅ Ya resuelto
const getById = async (id) => {
  const item = (await book.readAll()).find((p) => p.id === id);
  if (!item) throw new HttpError(404, "Libro no encontrado");
  return item;
};

// TODO Paso 2: valida (400), genera el id (máximo + 1), agrega el registro con Product.pick, guarda y devuélvelo
const create = async (data) => {
  const error = validate(data, { partial: false });
  if (error) throw new HttpError(400, error);

  const books = await book.readAll();
  const nextId = books.reduce((max, b) => Math.max(max, b.id || 0), 0) + 1;

  const bookData = { ...data };
  if (bookData.name !== undefined && bookData.title === undefined) {
    bookData.title = bookData.name;
  }
  if (bookData.author !== undefined && bookData.Author === undefined) {
    bookData.Author = bookData.author;
  }
  if (bookData.available === undefined) {
    bookData.available = true;
  }

  const newBook = { ...book.pick(bookData), id: nextId };
  books.push(newBook);
  await book.writeAll(books);
  return newBook;
};

// TODO Paso 2: valida con { partial: true } (400); si el id no existe lanza 404; mezcla los campos, guarda y devuélvelo
const update = async (id, data) => {
  const error = validate(data, { partial: true });
  if (error) throw new HttpError(400, error);

  const books = await book.readAll();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) throw new HttpError(404, "Libro no encontrado");

  const bookData = { ...data };
  if (bookData.name !== undefined && bookData.title === undefined) {
    bookData.title = bookData.name;
  }
  if (bookData.author !== undefined && bookData.Author === undefined) {
    bookData.Author = bookData.author;
  }

  const updatedBook = { ...books[index], ...book.pick(bookData), id };
  books[index] = updatedBook;
  await book.writeAll(books);
  return updatedBook;
};

// TODO Paso 2: elimina por id; si no existía lanza 404
const remove = async (id) => {
  const books = await book.readAll();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) throw new HttpError(404, "Libro no encontrado");

  books.splice(index, 1);
  await book.writeAll(books);
};

const removeAll = async () => {
  await book.writeAll([]);
};

module.exports = { list, getById, create, update, remove, removeAll };
