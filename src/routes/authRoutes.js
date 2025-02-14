const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyRefreshToken } = require("../middleware/auth");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", verifyRefreshToken, authController.refreshTokens);
router.post("/logout", authController.logout);


module.exports = router;
