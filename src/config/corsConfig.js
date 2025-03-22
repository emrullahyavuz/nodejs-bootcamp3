const corsOptions = {
  origin: function (origin, callback) {
    // İzin verilen origins listesi
    const whiteList = [
      "http://localhost:3001",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://sandbox-api.iyzipay.com",
      "https://api.iyzipay.com",
      "https://sandbox-merchant.iyzipay.com",
      "https://merchant.iyzipay.com"
    ];

    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS politikası tarafından engellendiniz."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
  maxAge: 86400, // 24 saat
};

module.exports = corsOptions; 
