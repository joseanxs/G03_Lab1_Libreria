const { Router } = require("express");
const bookController = require("../controllers/book.controller");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();

// ✅ Ya resueltas
router.get("/", bookController.list);
router.get("/:id", bookController.getById);

// TODO Paso 2: agrega POST "/" → create, PUT "/:id" → update y DELETE "/:id" → remove
router.post("/", bookController.create);
router.put("/:id", bookController.update);
router.delete("/:id", bookController.remove);

module.exports = router;
