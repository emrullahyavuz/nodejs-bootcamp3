const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyRefreshToken } = require("../middleware/auth");
const { validateRegistration, validateLogin } = require("../validators");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Yeni kullanıcı kaydı
 *     description: Yeni bir kullanıcı kaydı oluşturur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 */
router.post("/register", validateRegistration, authController.registerUser);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcı girişi
 *     description: Kullanıcı email ve şifre ile giriş yapar. Başarılı olursa access ve refresh token döner.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Admin1234"
 *     responses:
 *       200:
 *         description: Giriş başarılı, access ve refresh token döner.
 *         headers:
 *           Set-Cookie:
 *             description: "Access ve refresh tokenlar cookie olarak set edilir."
 *             schema:
 *               type: string
 *               example: "accessToken=abcd1234; HttpOnly; Secure"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Giriş başarılı!"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       401:
 *         description: Geçersiz email veya şifre.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Geçersiz email veya şifre."
 *       400:
 *         description: Geçersiz istek veya sunucu hatası.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Beklenmeyen bir hata oluştu."
 */
router.post("/login", validateLogin, authController.loginUser);
router.post("/refresh-token", verifyRefreshToken, authController.refreshTokens);
router.post("/logout", authController.logout);

module.exports = router;
