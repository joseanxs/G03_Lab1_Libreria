const { Router } = require("express");
const adminController = require("../controllers/admin.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

const router = Router();
router.use(authenticateToken, requireRole("ADMIN"));

router.get("/orders", adminController.listOrders);
router.patch("/orders/:id/status", adminController.updateOrderStatus);
router.get("/reports/top-books", adminController.topBooks);

module.exports = router;
