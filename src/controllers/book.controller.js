const booksService = require("../services/book.service");
const HttpError = require("../utils/httpError");

// CONTROLADOR: lee la petición (params, body), llama al servicio y decide código + JSON.
// No lee archivos ni valida reglas de negocio. Los errores van a next(err) → errorHandler.

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

// ✅ Ya resuelto: GET / → 200
const list = async (req, res, next) => {
  try {
    res.json(await booksService.list()); // 200
  } catch (err) {
    next(err);
  }
};

// ✅ Ya resuelto: GET /:id → 200 (el servicio lanza 404 si no existe)
const getById = async (req, res, next) => {
  try {
    res.json(await booksService.getById(parseId(req))); // 200
  } catch (err) {
    next(err);
  }
};

// TODO Paso 2: POST / → llama a booksService.create(req.body ?? {}) y responde 201 con el registro
const create = async (req, res, next) => {
  try {
    const nuevo = await booksService.create(req.body ?? {});
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

// TODO Paso 2: PUT /:id → llama a booksService.update(parseId(req), req.body ?? {}) y responde 200
const update = async (req, res, next) => {
  try {
    const actualizado = await booksService.update(parseId(req), req.body ?? {});
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
};

// TODO Paso 2: DELETE /:id → llama a booksService.remove(parseId(req)) y responde 204 sin cuerpo (res.status(204).end())
const remove = async (req, res, next) => {
  try {
    await booksService.remove(parseId(req));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const removeAll = async (req, res, next) => {
  try {
    await booksService.removeAll();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const createMany = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      throw new HttpError(400, "El body debe ser un arreglo con al menos un libro");
    }
    res.status(201).json(await booksService.createMany(req.body));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove, removeAll, createMany };
