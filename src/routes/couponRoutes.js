const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { verifyAccessToken, authorizeRoles } = require("../middleware/auth");
const { validateCouponCreate, validateCouponUpdate, validateCouponValidation } = require("../validators/couponValidator");

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Kupon yönetimi
 */

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Tüm kuponları getir
 *     description: Sistemdeki tüm kuponları döndürür. Sayfalama, arama ve filtreleme özellikleri sunar.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
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
 *         description: Kupon koduna göre arama
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sıralama alanı (ör. -createdAt, code) - için ters sıralama
 *     responses:
 *       200:
 *         description: Kupon listesi başarıyla getirildi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.get("/", verifyAccessToken, authorizeRoles("admin"), couponController.getAllCoupons);

/**
 * @swagger
 * /api/coupons/{id}:
 *   get:
 *     summary: Kupon detayını getir
 *     description: Belirtilen ID'ye sahip kuponun detayını getirir
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon ID'si
 *     responses:
 *       200:
 *         description: Kupon detayı başarıyla getirildi
 *       404:
 *         description: Kupon bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.get("/:id", verifyAccessToken, authorizeRoles("admin"), couponController.getCouponById);

/**
 * @swagger
 * /api/coupons/code/{code}:
 *   get:
 *     summary: Kupon koduna göre kupon getir
 *     description: Belirtilen koda sahip kuponun detayını getirir
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon kodu
 *     responses:
 *       200:
 *         description: Kupon detayı başarıyla getirildi
 *       404:
 *         description: Kupon bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get("/code/:code", couponController.getCouponByCode);

/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: Kuponun geçerliliğini kontrol et
 *     description: Kuponun geçerliliğini kontrol eder ve indirim tutarını hesaplar
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - cart
 *             properties:
 *               code:
 *                 type: string
 *                 description: Kupon kodu
 *               cart:
 *                 type: array
 *                 description: Sepet ürünleri
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Ürün ID'si
 *                     quantity:
 *                       type: number
 *                       description: Ürün adedi
 *                     price:
 *                       type: number
 *                       description: Ürün fiyatı
 *     responses:
 *       200:
 *         description: Kupon geçerli
 *       400:
 *         description: Geçersiz kupon veya sepet
 *       404:
 *         description: Kupon bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post("/validate", validateCouponValidation, couponController.validateCoupon);

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Yeni kupon oluştur
 *     description: Yeni bir kupon oluşturur
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *               - endDate
 *             properties:
 *               code:
 *                 type: string
 *                 description: Kupon kodu
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 description: İndirim tipi (percentage=yüzde, fixed=sabit)
 *               value:
 *                 type: number
 *                 description: İndirim değeri
 *               minPurchase:
 *                 type: number
 *                 description: Minimum alışveriş tutarı
 *               maxDiscount:
 *                 type: number
 *                 description: Maksimum indirim tutarı (sadece yüzde indirimlerde)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Başlangıç tarihi
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Bitiş tarihi
 *               usageLimit:
 *                 type: number
 *                 description: Kullanım limiti
 *               isActive:
 *                 type: boolean
 *                 description: Aktif mi?
 *               applicableProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Uygulanabilir ürün ID'leri
 *               applicableCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Uygulanabilir kategori ID'leri
 *     responses:
 *       201:
 *         description: Kupon başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek veya veri
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  "/",
  verifyAccessToken,
  authorizeRoles("admin"),
  validateCouponCreate,
  couponController.createCoupon
);

/**
 * @swagger
 * /api/coupons/{id}:
 *   put:
 *     summary: Kupon güncelle
 *     description: Belirtilen ID'ye sahip kuponu günceller
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Kupon kodu
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 description: İndirim tipi (percentage=yüzde, fixed=sabit)
 *               value:
 *                 type: number
 *                 description: İndirim değeri
 *               minPurchase:
 *                 type: number
 *                 description: Minimum alışveriş tutarı
 *               maxDiscount:
 *                 type: number
 *                 description: Maksimum indirim tutarı (sadece yüzde indirimlerde)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Başlangıç tarihi
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Bitiş tarihi
 *               usageLimit:
 *                 type: number
 *                 description: Kullanım limiti
 *               isActive:
 *                 type: boolean
 *                 description: Aktif mi?
 *               applicableProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Uygulanabilir ürün ID'leri
 *               applicableCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Uygulanabilir kategori ID'leri
 *     responses:
 *       200:
 *         description: Kupon başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek veya veri
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kupon bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  "/:id",
  verifyAccessToken,
  authorizeRoles("admin"),
  validateCouponUpdate,
  couponController.updateCoupon
);

/**
 * @swagger
 * /api/coupons/{id}:
 *   delete:
 *     summary: Kupon sil
 *     description: Belirtilen ID'ye sahip kuponu siler
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kupon ID'si
 *     responses:
 *       200:
 *         description: Kupon başarıyla silindi
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kupon bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  "/:id",
  verifyAccessToken,
  authorizeRoles("admin"),
  couponController.deleteCoupon
);

/**
 * @swagger
 * /api/coupons/usage/increment:
 *   post:
 *     summary: Kupon kullanım sayısını artır
 *     description: Belirtilen kodlu kuponun kullanım sayısını bir artırır
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Kupon kodu
 *     responses:
 *       200:
 *         description: Kupon kullanım sayısı başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek veya veri
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kupon bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  "/usage/increment",
  verifyAccessToken,
  couponController.incrementCouponUsage
);

module.exports = router; 