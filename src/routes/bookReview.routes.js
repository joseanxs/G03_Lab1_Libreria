const { Router } = require("express");
const bookReviewController = require("../controllers/bookReview.controller");

const router = Router();

router.post("/", bookReviewController.create);

module.exports = router;
