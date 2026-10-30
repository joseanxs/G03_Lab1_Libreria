const categoryService = require("../services/category.service");
const HttpError = require("../utils/httpError");

// CONTROLADOR de categorías y búsqueda: lee la petición, llama al servicio y decide código + JSON.
// No usa Prisma ni valida reglas de negocio. Los errores van a next(err) → errorHandler.

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

// POST /api/categories → 201
const create = async (req, res, next) => {
  try {
    res.status(201).json(await categoryService.create(req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// GET /api/categories → 200
const list = async (req, res, next) => {
  try {
    res.json(await categoryService.list());
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id/categories → 200
const setBookCategories = async (req, res, next) => {
  try {
    res.json(await categoryService.setBookCategories(parseId(req), req.body?.categoryIds));
  } catch (err) {
    next(err);
  }
};

// GET /api/books/search?q&category&min&max&sort&page&limit → 200
const search = async (req, res, next) => {
  try {
    res.json(await categoryService.search(req.query));
  } catch (err) {
    next(err);
  }
};

// RETO · GET /api/categories/:id/products → 200
const booksByCategory = async (req, res, next) => {
  try {
    res.json(await categoryService.booksByCategory(parseId(req), req.query));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, setBookCategories, search, booksByCategory };
