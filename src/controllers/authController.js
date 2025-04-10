const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const EmailService = require("../utils/emailService");

const generateTokens = (user) => {
  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const refreshTokenPayload = { id: user._id };

  const newAccessToken = jwt.sign(accessTokenPayload, accessToken.secret, {
    expiresIn: accessToken.expiresIn,
  });

  const newRefreshToken = jwt.sign(refreshTokenPayload, refreshToken.secret, {
    expiresIn: refreshToken.expiresIn,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const registerUser = async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email adresi zaten kayıtlı." });
    }

    // Create new user
    const user = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    await user.save();

    EmailService.sendWelcomeEmail(user)
      .then((result) => {
        console.log("Hoş geldiniz e-postası durumu:", result.success);
      })
      .catch((error) => {
        console.error("E-posta gönderiminde hata:", error);
      });

      EmailService.sendAdminNotification(user)
      .then((result) => {
        console.log("Admin bildirim e-postası durumu:", result.success);
      })
      .catch((error) => {
        console.error("Admin e-posta gönderiminde hata:", error);
      });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Geçersiz email veya şifre." });
    }

    // Şifreyi kontrol et
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: "Geçersiz email veya şifre." });
    }

    // Kullanıcının eski tüm refresh tokenlarını sil
    await RefreshToken.deleteMany({ userId: user._id });

    // Yeni tokenları oluştur
    const tokens = generateTokens(user);

    // Yeni refresh token'ı veritabanına kaydet
    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
    });

    // Cookie'leri ayarla
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    // Kullanıcı bilgilerinden şifreyi çıkar
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Giriş başarılı!",
      user: userResponse,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const refreshTokens = async (req, res) => {
  try {
    const oldRefreshToken = req.body.refreshToken;
    console.log(req.user);

    // Remove old refresh token
    await RefreshToken.deleteOne({ token: oldRefreshToken });

    // Generate new tokens
    const tokens = generateTokens(req.user);

    // Save new refresh token
    await RefreshToken.create({
      userId: req.user.id,
      token: tokens.refreshToken,
    });

    // Set cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Tokens refreshed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      RefreshToken.deleteOne({ token: refreshToken });
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logout,
};
