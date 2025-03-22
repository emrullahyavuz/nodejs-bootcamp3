const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
/* const corsOptions = require("./config/corsConfig"); */
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const whiteList = [
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://sandbox-api.iyzipay.com',
      'https://api.iyzipay.com',
      'https://sandbox-merchant.iyzipay.com',
      'https://merchant.iyzipay.com',
    ];

    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Reddedilen origin:', origin);
      callback(null, true); // Geliştirme aşamasında tüm originlere izin ver
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['Set-Cookie'],
};

// Middleware
app.use(morgan('dev'));
app.use(cors(corsOptions));

// İyzico webhook için raw body gerekiyor
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Diğer rotalar için JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger);

// Statik dosta servisi için uploads klasörünü dışarı aç
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/chat', chatRoutes);

// Swagger dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static dosyalar
app.use(express.static(path.join(__dirname, 'views')));

// Form route'u
app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

// Hata yakalama
app.use(errorHandler);

module.exports = app;
