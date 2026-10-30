const { Router } = require("express");
const authRoutes = require("./auth.routes");
const bookRoutes = require("./book.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");

const router = Router();
const categoryRoutes = require("./category.routes");
router.use("/categories", categoryRoutes);
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
