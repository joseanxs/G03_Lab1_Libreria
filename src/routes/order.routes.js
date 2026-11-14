const { Router } = require("express");
const orderController = require("../controllers/order.controller");
const { authenticateToken } = require("../middlewares/auth");

const router = Router();
router.use(authenticateToken);

router.post("/", orderController.create);
router.get("/", orderController.listMine);
router.patch("/:id/cancel", orderController.cancel);
router.get("/:id/history", orderController.history);

module.exports = router;
