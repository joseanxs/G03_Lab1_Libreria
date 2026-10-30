const { Router } = require("express");
const bookController = require("../controllers/book.controller");
const categoryController = require("../controllers/category.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// RUTAS: conectan cada verbo + URL con una acción del controlador
// Leer el catálogo es público; modificarlo, solo ADMIN
const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

// ⚠️ Rutas estáticas SIEMPRE antes que las dinámicas (/:id)
router.get("/search", categoryController.search);
router.get("/", bookController.list);
router.get("/:id", bookController.getById);

router.post("/", onlyAdmin, bookController.create);
router.post("/lote", onlyAdmin, bookController.createMany);
router.put("/:id/categories", onlyAdmin, categoryController.setBookCategories);
router.put("/:id", onlyAdmin, bookController.update);
router.delete("/:id", onlyAdmin, bookController.remove);
router.delete("/", onlyAdmin, bookController.removeAll);

module.exports = router;