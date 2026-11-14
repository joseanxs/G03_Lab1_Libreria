const booksService = require("../services/book.service");
const HttpError = require("../utils/httpError");


const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

const list = async (req, res, next) => {
  try {
    res.json(await booksService.list());
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    res.json(await booksService.getById(parseId(req)));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const nuevo = await booksService.create(req.body ?? {});
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const actualizado = await booksService.update(parseId(req), req.body ?? {});
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
};

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
