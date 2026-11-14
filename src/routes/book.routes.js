const { Router } = require("express");
const bookController = require("../controllers/book.controller");
const categoryController = require("../controllers/category.controller");
const reviewController = require("../controllers/review.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

// Declarar /search antes de /:id para evitar que se interprete como un identificador.
router.get("/search", categoryController.search);

router.get("/", bookController.list);
router.get("/:id", bookController.getById);

router.put("/:id/categories", onlyAdmin, categoryController.setBookCategories);

router.get("/:id/reviews", reviewController.list);
router.post("/:id/reviews", authenticateToken, reviewController.create);

router.post("/", onlyAdmin, bookController.create);
router.post("/lote", onlyAdmin, bookController.createMany);
router.put("/:id", onlyAdmin, bookController.update);
router.delete("/:id", onlyAdmin, bookController.remove);
router.delete("/", onlyAdmin, bookController.removeAll);

module.exports = router;
