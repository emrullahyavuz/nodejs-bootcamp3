const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyAccessToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm kullanıcıları getir
 *     description: Sistemdeki tüm kullanıcıları döndürür.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi başarıyla getirildi.
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
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *       401:
 *         description: Yetkisiz erişim.
 *       500:
 *         description: Sunucu hatası.
 */
router.get("/", verifyAccessToken, userController.getAllUsers);
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Yeni kullanıcı oluştur
 *     description: Yeni bir kullanıcı ekler.
 *     tags: [Users]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu.
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
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *       400:
 *         description: Geçersiz istek.
 *       401:
 *         description: Yetkisiz erişim.
 */
router.post("/", verifyAccessToken, userController.createUser);
/**
 * @swagger
 * /api/users:
 *   put:
 *     summary: Kullanıcıyı güncelle
 *     description: Belirtilen kullanıcıyı günceller.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - email
 *             properties:
 *               id:
 *                 type: string
 *                 example: "65dfc48f9e8d4b001fef7a12"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65dfc48f9e8d4b001fef7a12"
 *                     email:
 *                       type: string
 *                       example: "newemail@example.com"
 *       400:
 *         description: Geçersiz istek.
 *       401:
 *         description: Yetkisiz erişim.
 *       404:
 *         description: Kullanıcı bulunamadı.
 */
router.put("/", verifyAccessToken, userController.updateUser);
/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Kullanıcıyı sil
 *     description: Belirtilen kullanıcıyı siler.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Silinecek kullanıcının ID'si
 *     responses:
 *       204:
 *         description: Kullanıcı başarıyla silindi.
 *       400:
 *         description: Geçersiz istek.
 *       401:
 *         description: Yetkisiz erişim.
 *       404:
 *         description: Kullanıcı bulunamadı.
 */
router.delete("/:userId", verifyAccessToken, userController.deleteUser);

module.exports = router;