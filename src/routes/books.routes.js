const { Router } = require("express");
const booksController = require("../controllers/books.controller");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();

// ✅ Ya resueltas
router.get("/", booksController.list);
router.get("/:id", booksController.getById);

// TODO Paso 2: agrega POST "/" → create, PUT "/:id" → update y DELETE "/:id" → remove

module.exports = router;
