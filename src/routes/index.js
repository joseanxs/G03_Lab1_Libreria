const { Router } = require("express");
const authRoutes = require("./auth.routes");
const bookRoutes = require("./book.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");
const categoryRoutes = require("./category.routes");
const reviewRoutes = require("./review.routes");
const bookReviewRoutes = require("./bookReview.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/book-reviews", bookReviewRoutes);

module.exports = router;