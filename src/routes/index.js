const { Router } = require("express");
const bookRoutes = require("./book.routes");

// Archivo principal de rutas: cada recurso se monta en su propio prefijo
const router = Router();

router.use("/books", bookRoutes); // → /api/books · TODO Paso 1: cambia /products por tu entidad

module.exports = router;
