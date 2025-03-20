const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAccessToken } = require("../middleware/auth");
const { validateProduct } = require("../validators");
const upload = require("../middleware/upload");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri getir
 *     description: Sistemdeki tüm ürünleri döndürür. Sayfalama, arama ve filtreleme özellikleri sunar.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Ürün adına göre arama
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sıralama alanı (ör. -createdAt, name, price) - için ters sıralama
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Kategori ID'sine göre filtreleme
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum fiyat değeri
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maksimum fiyat değeri
 *     responses:
 *       200:
 *         description: Ürün listesi başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: İşlem başarılı mı?
 *                 count:
 *                   type: integer
 *                   description: Döndürülen ürün sayısı
 *                 total:
 *                   type: integer
 *                   description: Toplam ürün sayısı
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Mevcut sayfa
 *                     limit:
 *                       type: integer
 *                       description: Sayfa başına ürün sayısı
 *                     totalPages:
 *                       type: integer
 *                       description: Toplam sayfa sayısı
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Sonraki sayfa var mı?
 *                     hasPrevPage:
 *                       type: boolean
 *                       description: Önceki sayfa var mı?
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                       description: Sonraki sayfa numarası (varsa)
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                       description: Önceki sayfa numarası (varsa)
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
 *     description: Belirtilen kategoriye ait ürünleri döndürür. Sayfalama, arama ve filtreleme özellikleri sunar.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Ürünlerin ait olduğu kategori ID'si
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Ürün adına göre arama
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sıralama alanı (ör. -createdAt, name, price) - için ters sıralama
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum fiyat değeri
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maksimum fiyat değeri
 *     responses:
 *       200:
 *         description: Kategorideki ürünler başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: İşlem başarılı mı?
 *                 count:
 *                   type: integer
 *                   description: Döndürülen ürün sayısı
 *                 total:
 *                   type: integer
 *                   description: Toplam ürün sayısı
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Mevcut sayfa
 *                     limit:
 *                       type: integer
 *                       description: Sayfa başına ürün sayısı
 *                     totalPages:
 *                       type: integer
 *                       description: Toplam sayfa sayısı
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Sonraki sayfa var mı?
 *                     hasPrevPage:
 *                       type: boolean
 *                       description: Önceki sayfa var mı?
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                       description: Sonraki sayfa numarası (varsa)
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                       description: Önceki sayfa numarası (varsa)
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
/**
 * @swagger
 * /api/products/{slug}/image:
 *   post:
 *     summary: Ürüne görsel yükle
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Ürünün slug değeri
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek görsel dosyası
 *     responses:
 *       200:
 *         description: Görsel başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Görsel başarıyla yüklendi."
 *                 image:
 *                   type: string
 *                   example: "uploads/product-image.jpg"
 *                 imageUrl:
 *                   type: string
 *                   example: "http://localhost:5000/uploads/product-image.jpg"
 *       400:
 *         description: Görsel yüklenmedi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lütfen bir görsel yükleyin."
 *       404:
 *         description: Ürün bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ürün bulunamadı."
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Görsel yüklenirken bir hata oluştu."
 */
router.post(
  "/:slug/image",
  verifyAccessToken,
  upload.single("image"),
  productController.uploadProductImage
);
