const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken.js");

const generateTokens = (user) => {
  const accessTokenPayload = { id: user.id, email: user.email };
  const refreshTokenPayload = { id: user.id };

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
    const { password, ...otherData } = req.body;

    // Password hash'leme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now(),
      ...otherData,
      password: hashedPassword, // Hash'lenmiş şifreyi kaydet
    };

    const usersFilePath = path.join(__dirname, "..", "..", "users.json");
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

    // Email kontrolü
    const existingUser = users.find((user) => user.email === newUser.email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email adresi zaten kayıtlı." });
    }

    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersFilePath = path.join(__dirname, "..", "..", "users.json");
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

    // Kullanıcıyı bul
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(401).json({ message: "Geçersiz email veya şifre." });
    }

    // Şifre kontrolü
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Geçersiz email veya şifre." });
    }

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    // JWT token oluştur
    const tokens = generateTokens(user);

    // Save refresh token
    RefreshToken.saveToken(user.id, tokens.refreshToken);

    res.status(200).json({
      message: "Giriş başarılı!",
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const refreshTokens = async (req, res) => {
  try {
    const oldRefreshToken = req.body.refreshToken;

    // Remove old refresh token
    RefreshToken.removeToken(oldRefreshToken);

    // Generate new tokens
    const tokens = generateTokens(req.user);

    // Save new refresh token
    RefreshToken.saveToken(req.user.id, tokens.refreshToken);

    res.json(tokens);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = (req, res) => {
  try {
    const { refreshToken } = req.body;
    RefreshToken.removeToken(refreshToken);
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
