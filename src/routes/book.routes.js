const { Router } = require("express");
const bookController = require("../controllers/book.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

// ✅ Ya resueltas
router.get("/", bookController.list);
router.get("/:id", bookController.getById);

// TODO Paso 2: agrega POST "/" → create, PUT "/:id" → update y DELETE "/:id" → remove

router.post("/", onlyAdmin, bookController.create);
router.post("/lote", onlyAdmin, bookController.createMany);
router.put("/:id", onlyAdmin, bookController.update);
router.delete("/:id", onlyAdmin, bookController.remove);
router.delete("/", onlyAdmin, bookController.removeAll);
module.exports = router;
