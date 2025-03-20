const { body, validationResult } = require("express-validator");

/**
 * Kupon oluşturma için validasyon kuralları
 */
const validateCouponCreate = [
  body("code")
    .notEmpty()
    .withMessage("Kupon kodu zorunludur")
    .isString()
    .withMessage("Kupon kodu metin olmalıdır")
    .isLength({ min: 3, max: 20 })
    .withMessage("Kupon kodu 3-20 karakter arasında olmalıdır")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kupon kodu sadece harf ve rakamlardan oluşmalıdır"),
  
  body("type")
    .notEmpty()
    .withMessage("İndirim tipi zorunludur")
    .isIn(["percentage", "fixed"])
    .withMessage("İndirim tipi 'percentage' veya 'fixed' olmalıdır"),
  
  body("value")
    .notEmpty()
    .withMessage("İndirim değeri zorunludur")
    .isFloat({ min: 0 })
    .withMessage("İndirim değeri pozitif bir sayı olmalıdır")
    .custom((value, { req }) => {
      if (req.body.type === "percentage" && value > 100) {
        throw new Error("Yüzde değeri 100'den büyük olamaz");
      }
      return true;
    }),
  
  body("minPurchase")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum alışveriş tutarı pozitif bir sayı olmalıdır"),
  
  body("maxDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maksimum indirim tutarı pozitif bir sayı olmalıdır"),
  
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Başlangıç tarihi geçerli bir ISO tarihi olmalıdır"),
  
  body("endDate")
    .notEmpty()
    .withMessage("Bitiş tarihi zorunludur")
    .isISO8601()
    .withMessage("Bitiş tarihi geçerli bir ISO tarihi olmalıdır")
    .custom((value, { req }) => {
      const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
      }
      return true;
    }),
  
  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Kullanım limiti pozitif bir tam sayı olmalıdır"),
  
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Aktif değeri boolean olmalıdır"),
  
  body("applicableProducts")
    .optional()
    .isArray()
    .withMessage("Uygulanabilir ürünler bir dizi olmalıdır"),
  
  body("applicableProducts.*")
    .optional()
    .isMongoId()
    .withMessage("Geçersiz ürün ID formatı"),
  
  body("applicableCategories")
    .optional()
    .isArray()
    .withMessage("Uygulanabilir kategoriler bir dizi olmalıdır"),
  
  body("applicableCategories.*")
    .optional()
    .isMongoId()
    .withMessage("Geçersiz kategori ID formatı"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Kupon güncelleme için validasyon kuralları
 */
const validateCouponUpdate = [
  body("code")
    .optional()
    .isString()
    .withMessage("Kupon kodu metin olmalıdır")
    .isLength({ min: 3, max: 20 })
    .withMessage("Kupon kodu 3-20 karakter arasında olmalıdır")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kupon kodu sadece harf ve rakamlardan oluşmalıdır"),
  
  body("type")
    .optional()
    .isIn(["percentage", "fixed"])
    .withMessage("İndirim tipi 'percentage' veya 'fixed' olmalıdır"),
  
  body("value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("İndirim değeri pozitif bir sayı olmalıdır")
    .custom((value, { req }) => {
      if (req.body.type === "percentage" && value > 100) {
        throw new Error("Yüzde değeri 100'den büyük olamaz");
      }
      return true;
    }),
  
  body("minPurchase")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum alışveriş tutarı pozitif bir sayı olmalıdır"),
  
  body("maxDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maksimum indirim tutarı pozitif bir sayı olmalıdır"),
  
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Başlangıç tarihi geçerli bir ISO tarihi olmalıdır"),
  
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Bitiş tarihi geçerli bir ISO tarihi olmalıdır")
    .custom((value, { req }) => {
      if (!req.body.startDate) return true;
      
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
      }
      return true;
    }),
  
  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Kullanım limiti pozitif bir tam sayı olmalıdır"),
  
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Aktif değeri boolean olmalıdır"),
  
  body("applicableProducts")
    .optional()
    .isArray()
    .withMessage("Uygulanabilir ürünler bir dizi olmalıdır"),
  
  body("applicableProducts.*")
    .optional()
    .isMongoId()
    .withMessage("Geçersiz ürün ID formatı"),
  
  body("applicableCategories")
    .optional()
    .isArray()
    .withMessage("Uygulanabilir kategoriler bir dizi olmalıdır"),
  
  body("applicableCategories.*")
    .optional()
    .isMongoId()
    .withMessage("Geçersiz kategori ID formatı"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Kupon doğrulama için validasyon kuralları
 */
const validateCouponValidation = [
  body("code")
    .notEmpty()
    .withMessage("Kupon kodu zorunludur")
    .isString()
    .withMessage("Kupon kodu metin olmalıdır"),
  
  body("cart")
    .notEmpty()
    .withMessage("Sepet bilgisi zorunludur")
    .isArray()
    .withMessage("Sepet bir dizi olmalıdır"),
  
  body("cart.*.productId")
    .notEmpty()
    .withMessage("Ürün ID'si zorunludur")
    .isMongoId()
    .withMessage("Geçersiz ürün ID formatı"),
  
  body("cart.*.quantity")
    .notEmpty()
    .withMessage("Ürün adedi zorunludur")
    .isInt({ min: 1 })
    .withMessage("Ürün adedi en az 1 olmalıdır"),
  
  body("cart.*.price")
    .notEmpty()
    .withMessage("Ürün fiyatı zorunludur")
    .isFloat({ min: 0 })
    .withMessage("Ürün fiyatı pozitif bir sayı olmalıdır"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateCouponCreate,
  validateCouponUpdate,
  validateCouponValidation
}; 