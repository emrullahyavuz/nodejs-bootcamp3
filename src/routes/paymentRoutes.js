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