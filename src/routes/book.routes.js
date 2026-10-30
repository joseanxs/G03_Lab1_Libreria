const { Router } = require("express");
const bookController = require("../controllers/book.controller");
const categoryController = require("../controllers/category.controller");
const reviewController = require("../controllers/review.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

// Taller B: /search DEBE declararse antes de /:id para no ser capturado como id numérico
router.get("/search", categoryController.search);

// Rutas base de libros
router.get("/", bookController.list);
router.get("/:id", bookController.getById);

// Taller B: reemplazar categorías del libro con set
router.put("/:id/categories", onlyAdmin, categoryController.setBookCategories);

// Taller A: listar y crear reseñas del libro
router.get("/:id/reviews", reviewController.list);
router.post("/:id/reviews", authenticateToken, reviewController.create);

router.post("/", onlyAdmin, bookController.create);
router.post("/lote", onlyAdmin, bookController.createMany);
router.put("/:id", onlyAdmin, bookController.update);
router.delete("/:id", onlyAdmin, bookController.remove);
router.delete("/", onlyAdmin, bookController.removeAll);

module.exports = router;
