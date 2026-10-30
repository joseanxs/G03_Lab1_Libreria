const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// RUTAS: ver categorías es público; crearlas, solo ADMIN
const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

router.get("/", categoryController.list);
router.post("/", onlyAdmin, categoryController.create);
router.get("/:id/books", categoryController.booksByCategory); // reto opcional

module.exports = router;
