const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAccessToken } = require("../middleware/auth");

router.get("/", productController.getAllProducts);
router.post("/", verifyAccessToken, productController.createProduct);
router.put("/:id", verifyAccessToken, productController.updateProduct);
router.delete(
  "/:productId",
  verifyAccessToken,
  productController.deleteProduct
);

module.exports = router;
