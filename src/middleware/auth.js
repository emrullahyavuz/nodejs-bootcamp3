const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");

const verifyAccessToken = (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, accessToken.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(403).json({ message: "Refresh token required" });
  }

  try {
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(token, refreshToken.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      await RefreshToken.deleteOne({
        token: req.cookies.refreshToken || req.body.refreshToken,
      });
      return res.status(403).json({ message: "Expired refresh token" });
    }
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
