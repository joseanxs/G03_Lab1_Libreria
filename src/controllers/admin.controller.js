const adminService = require("../services/admin.service");
const HttpError = require("../utils/httpError");

const listOrders = async (req, res, next) => {
  try {
    res.json(await adminService.listOrders(req.query));
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
    res.json(await adminService.updateOrderStatus(req.user.id, id, req.body?.status, req.body?.note));
  } catch (err) {
    next(err);
  }
};

const topBooks = async (req, res, next) => {
  try {
    res.json(await adminService.topBooks(req.query.limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { listOrders, updateOrderStatus, topBooks };
