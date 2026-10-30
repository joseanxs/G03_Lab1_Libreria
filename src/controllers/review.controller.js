const reviewService = require("../services/review.service");
const HttpError = require("../utils/httpError");

const parseId = (req) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
    return id;
};

const create = async (req, res, next) => {
    try {
        res.status(201).json(await reviewService.create(req.user.id, parseId(req), req.body ?? {}));
    } catch (err) {
        next(err);
    }
};

const list = async (req, res, next) => {
    try {
        res.json(await reviewService.listByBook(parseId(req), req.query));
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await reviewService.remove(req.user, parseId(req));
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

module.exports = { create, list, remove };
