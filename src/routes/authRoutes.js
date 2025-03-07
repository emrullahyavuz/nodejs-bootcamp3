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
 *                 example: "emin@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Emin1234"
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
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Access ve Refresh Token'ı yenile
 *     description: Geçerli bir refresh token ile yeni access ve refresh token oluşturur.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "old_refresh_token_here"
 *     responses:
 *       200:
 *         description: Yeni access ve refresh token oluşturuldu.
 *         headers:
 *           Set-Cookie:
 *             description: "Yeni access ve refresh tokenlar cookie olarak set edilir."
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
 *                   example: "Tokens refreshed"
 *       400:
 *         description: Geçersiz veya süresi dolmuş refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Geçersiz refresh token."
 */
router.post("/refresh-token", verifyRefreshToken, authController.refreshTokens);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcıyı çıkış yaptır
 *     description: Kullanıcının access ve refresh token'larını temizler ve çıkış yapmasını sağlar.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Başarıyla çıkış yapıldı.
 *         headers:
 *           Set-Cookie:
 *             description: "Access ve refresh tokenlar temizlenir."
 *             schema:
 *               type: string
 *               example: "accessToken=; HttpOnly; Secure; Max-Age=0"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       400:
 *         description: Çıkış işlemi sırasında hata oluştu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Çıkış işlemi başarısız."
 */
router.post("/logout", authController.logout);

module.exports = router;
