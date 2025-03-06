const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAccessToken } = require("../middleware/auth");
const { validateProduct } = require("../validators");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri getir
 *     description: Sistemdeki tüm ürünleri döndürür.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Ürün listesi başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Sunucu hatası.
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni ürün oluştur
 *     description: Yeni bir ürün ekler.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Ürün başarıyla oluşturuldu.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Geçersiz istek.
 *       401:
 *         description: Yetkisiz erişim.
 *       500:
 *         description: Sunucu hatası.
 */
router.post(
  "/",
  verifyAccessToken,
  validateProduct,
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Ürünü güncelle
 *     description: Belirtilen ürünü günceller.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Güncellenecek ürünün ID'si
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Ürün başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Ürün bulunamadı.
 *       400:
 *         description: Geçersiz istek.
 *       500:
 *         description: Sunucu hatası.
 */
router.put(
  "/:id",
  verifyAccessToken,
  validateProduct,
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Kategoriye göre ürünleri getir
 *     description: Belirtilen kategoriye ait ürünleri döndürür.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Ürünlerin ait olduğu kategori ID'si
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kategorideki ürünler başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Kategoride ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 */
router.get("/category/:categoryId", productController.getProductsByCategory);

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     summary: Ürünü sil
 *     description: Belirtilen ürünü siler.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Silinecek ürünün ID'si
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Ürün başarıyla silindi.
 *       404:
 *         description: Ürün bulunamadı.
 *       401:
 *         description: Yetkisiz erişim.
 *       500:
 *         description: Sunucu hatası.
 */
router.delete(
  "/:productId",
  verifyAccessToken,
  productController.deleteProduct
);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - description
 *         - stock
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           example: "6502b4a5c13c3c002b7f4e6d"
 *         name:
 *           type: string
 *           example: "iPhone 13"
 *         price:
 *           type: number
 *           example: 999.99
 *         description:
 *           type: string
 *           example: "Apple iPhone 13 with 128GB Storage"
 *         stock:
 *           type: integer
 *           example: 10
 *         category:
 *           type: string
 *           example: "6502b4a5c13c3c002b7f4e70"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Slug ile ürün getir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Ürünün slug değeri
 *     responses:
 *       200:
 *         description: Ürün başarıyla getirildi
 *       404:
 *         description: Ürün bulunamadı
 */
router.get("/slug/:slug", productController.getProductBySlug);
