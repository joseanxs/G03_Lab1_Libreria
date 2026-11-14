const categoryService = require("../services/category.service");
const HttpError = require("../utils/httpError");


const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await categoryService.create(req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    res.json(await categoryService.list());
  } catch (err) {
    next(err);
  }
};

const setBookCategories = async (req, res, next) => {
  try {
    res.json(await categoryService.setBookCategories(parseId(req), req.body?.categoryIds));
  } catch (err) {
    next(err);
  }
};

const search = async (req, res, next) => {
  try {
    res.json(await categoryService.search(req.query));
  } catch (err) {
    next(err);
  }
};

const booksByCategory = async (req, res, next) => {
  try {
    res.json(await categoryService.booksByCategory(parseId(req), req.query));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, setBookCategories, search, booksByCategory };