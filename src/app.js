const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const corsOptions = require("./config/corsConfig");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger);

// Statik dosta servisi için uploads klasörünü dışarı aç
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Swagger dokümantasyonu
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static dosyalar
app.use(express.static(path.join(__dirname, "views")));

// Form route'u
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Hata yakalama
app.use(errorHandler);

module.exports = app;
