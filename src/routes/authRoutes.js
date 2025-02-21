const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyRefreshToken } = require("../middleware/auth");
const { validateRegistration, validateLogin } = require("../validators");

router.post("/register", validateRegistration, authController.registerUser);
router.post("/login", validateLogin, authController.loginUser);
router.post("/refresh-token", verifyRefreshToken, authController.refreshTokens);
router.post("/logout", authController.logout);

module.exports = router;
