const { Router } = require("express");
const authRoutes = require("./auth.routes");
const bookRoutes = require("./book.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");
const reviewsRoutes = require("./review.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/reviews", reviewsRoutes);

module.exports = router;
