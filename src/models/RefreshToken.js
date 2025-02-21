const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expired: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
