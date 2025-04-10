const nodemailer = require("nodemailer");

// Nodemailer transport oluşturucu
const createTransporter = () => {
  // SMTP yapılandırması - gerçek bir email servisi kullanılmalıdır
  // Not: Gerçek projede bu bilgiler .env dosyasından alınmalıdır
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: process.env.MAIL_PORT || 587,
    secure: process.env.MAIL_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER || "your-email@gmail.com", // gmail hesabı
      pass: process.env.MAIL_PASS || "your-app-password", // gmail app şifresi
    },
  });
};

module.exports = {
  createTransporter,
};
