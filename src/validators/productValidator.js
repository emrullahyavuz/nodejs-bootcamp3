const { body } = require("express-validator");

const productValidationRules = {
  name: body("name")
    .trim()
    .notEmpty()
    .withMessage("Ürün adı boş bırakılamaz.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Ürün adı en az 2, en fazla 50 karakter olmalıdır."),

  price: body("price")
    .isFloat({ min: 0 })
    .withMessage("Fiyat sıfırdan büyük olmalıdır."),

  description: body("description")
    .trim()
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Açıklama en az 10, en fazla 500 karakter olmalıdır."),

  stock: body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stok sayısal bir değer olmalıdır."),

  category: body("category")
    .trim()
    .notEmpty()
    .withMessage("Kategori boş bırakılamaz.")
    .isMongoId()
    .withMessage("Kategori geçerli bir ID olmalıdır."),
};

module.exports = productValidationRules;
