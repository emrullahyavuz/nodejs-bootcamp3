const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController.js");
const { validateCategory } = require("../validators");
const { verifyAccessToken } = require("../middleware/auth");

router.get("/", categoryController.getAllCategories);
router.post(
  "/",
  verifyAccessToken,
  validateCategory,
  categoryController.createCategory
);
router.put(
  "/:id",
  verifyAccessToken,
  validateCategory,
  categoryController.updateCategory
);
router.delete(
  "/:categoryId",
  verifyAccessToken,
  categoryController.deleteCategory
);

module.exports = router;
