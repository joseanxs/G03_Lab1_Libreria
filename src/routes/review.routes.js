const { Router } = require("express");
const reviewController = require("../controllers/review.controller");
const { authenticateToken } = require("../middlewares/auth");

// RUTAS de reseñas. Crear y listar cuelgan de /api/books/:id/reviews (ver book.routes.js)
const router = Router();

router.delete("/:id", authenticateToken, reviewController.remove);

module.exports = router;
