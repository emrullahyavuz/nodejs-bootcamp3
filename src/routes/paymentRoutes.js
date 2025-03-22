const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

/**
 * @swagger
 * /api/payments/create-checkout-session:
 *   post:
 *     summary: Stripe ödeme oturumu oluştur
 *     description: Ürün için Stripe ödeme oturumu oluşturur
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ödeme oturumu başarıyla oluşturuldu
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post("/create-checkout-session", paymentController.createCheckoutSession);

/**
 * @swagger
 * /api/payments/create-iyzico-payment:
 *   post:
 *     summary: İyzico ödeme formu oluştur
 *     description: Ürün için İyzico ödeme formu oluşturur
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ödeme formu başarıyla oluşturuldu
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post("/create-iyzico-payment", paymentController.createIyzicoPayment);

/**
 * @swagger
 * /api/payments/iyzico-callback:
 *   post:
 *     summary: İyzico ödeme sonucu
 *     description: İyzico'dan gelen ödeme sonucunu işler
 *     tags: [Payments]
 *     responses:
 *       302:
 *         description: Başarılı veya başarısız sayfasına yönlendirir
 */
router.post("/iyzico-callback", paymentController.handleIyzicoCallback);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe webhook
 *     description: Stripe'dan gelen webhook isteklerini işler
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook başarıyla işlendi
 *       400:
 *         description: Geçersiz webhook isteği
 *       500:
 *         description: Sunucu hatası
 */
router.post("/webhook", paymentController.handleWebhook);

module.exports = router; 