const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController.js");
const { validateCategory } = require("../validators");
const { verifyAccessToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Tüm kategorileri getir
 *     description: Sistemdeki tüm kategorileri döndürür.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kategori listesi başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65dfc48f9e8d4b001fef7a12"
 *                   name:
 *                     type: string
 *                     example: "Elektronik"
 *                   description:
 *                     type: string
 *                     example: "Elektronik ürünler için kategori"
 *       500:
 *         description: Sunucu hatası.
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Yeni kategori oluştur
 *     description: Yeni bir kategori oluşturur.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Elektronik"
 *               description:
 *                 type: string
 *                 example: "Elektronik ürünler için kategori"
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65dfc48f9e8d4b001fef7a12"
 *                 name:
 *                   type: string
 *                   example: "Elektronik"
 *                 description:
 *                   type: string
 *                   example: "Elektronik ürünler için kategori"
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
  validateCategory,
  categoryController.createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Kategoriyi güncelle
 *     description: Belirtilen kategoriyi günceller.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Güncellenmesi gereken kategori ID'si.
 *         schema:
 *           type: string
 *           example: "65dfc48f9e8d4b001fef7a12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Yeni Elektronik"
 *               description:
 *                 type: string
 *                 example: "Yeni elektronik ürünler için kategori"
 *     responses:
 *       200:
 *         description: Kategori başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65dfc48f9e8d4b001fef7a12"
 *                 name:
 *                   type: string
 *                   example: "Yeni Elektronik"
 *                 description:
 *                   type: string
 *                   example: "Yeni elektronik ürünler için kategori"
 *       400:
 *         description: Geçersiz istek.
 *       401:
 *         description: Yetkisiz erişim.
 *       404:
 *         description: Kategori bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 */
router.put(
  "/:id",
  verifyAccessToken,
  validateCategory,
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   delete:
 *     summary: Kategoriyi sil
 *     description: Belirtilen kategoriyi siler.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Silinecek kategori ID'si.
 *         schema:
 *           type: string
 *           example: "65dfc48f9e8d4b001fef7a12"
 *     responses:
 *       204:
 *         description: Kategori başarıyla silindi.
 *       400:
 *         description: Geçersiz istek.
 *       401:
 *         description: Yetkisiz erişim.
 *       404:
 *         description: Kategori bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 */
router.delete(
  "/:categoryId",
  verifyAccessToken,
  categoryController.deleteCategory
);

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Slug ile kategori getir
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Kategorinin slug değeri
 *     responses:
 *       200:
 *         description: Kategori başarıyla getirildi
 *       404:
 *         description: Kategori bulunamadı
 */
router.get("/slug/:slug", categoryController.getCategoryBySlug);

module.exports = router;
