// src/models/RefreshToken.js
const fs = require("fs");
const path = require("path");

class RefreshToken {
  constructor() {
    this.filePath = path.join(__dirname, "..", "..", "refreshTokens.json");
    this.initializeTokenFile();
  }

  initializeTokenFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  saveToken(userId, token) {
    const tokens = this.getAllTokens();
    // Remove existing tokens for this user
    const filteredTokens = tokens.filter((t) => t.userId !== userId);
    filteredTokens.push({
      userId,
      token,
      createdAt: new Date().toISOString(),
    });
    fs.writeFileSync(this.filePath, JSON.stringify(filteredTokens, null, 2));
  }

  removeToken(token) {
    const tokens = this.getAllTokens();
    const filteredTokens = tokens.filter((t) => t.token !== token);
    fs.writeFileSync(this.filePath, JSON.stringify(filteredTokens, null, 2));
  }

  findToken(token) {
    const tokens = this.getAllTokens();
    return tokens.find((t) => t.token === token);
  }

  getAllTokens() {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, "utf8"));
    } catch (error) {
      return [];
    }
  }
}

module.exports = new RefreshToken();
