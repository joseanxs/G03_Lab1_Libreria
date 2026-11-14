const bookReviewService = require("../services/bookReview.service");

const handleError = (err, res, next) => {
  if (err.name === "ValidationError") {
    const errors = Object.entries(err.errors).map(([campo, e]) => ({
      field: campo,
      message: e.name === "CastError" ? `El valor '${e.value}' no es válido para ${campo}` : e.message,
    }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }
  return next(err);
};

const create = async (req, res, next) => {
  try {
    const review = await bookReviewService.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    handleError(err, res, next);
  }
};

module.exports = { create };
