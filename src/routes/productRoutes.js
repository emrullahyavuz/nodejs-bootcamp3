const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAccessToken } = require("../middleware/auth");
const { validateProduct } = require("../validators");

router.get("/", productController.getAllProducts);
router.post(
  "/",
  verifyAccessToken,
  validateProduct,
  productController.createProduct
);
router.put(
  "/:id",
  verifyAccessToken,
  validateProduct,
  productController.updateProduct
);
router.delete(
  "/:productId",
  verifyAccessToken,
  productController.deleteProduct
);

module.exports = router;
