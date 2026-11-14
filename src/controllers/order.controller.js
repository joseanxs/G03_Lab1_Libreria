const orderService = require("../services/order.service");
const HttpError = require("../utils/httpError");

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await orderService.create(req.user.id, req.body?.items));
  } catch (err) {
    next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    res.json(await orderService.listByUser(req.user.id));
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    res.json(await orderService.cancel(req.user.id, parseId(req)));
  } catch (err) {
    next(err);
  }
};

const history = async (req, res, next) => {
  try {
    res.json(await orderService.getHistory(req.user, parseId(req)));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listMine, cancel, history };
