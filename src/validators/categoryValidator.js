const { body } = require("express-validator");

const categoryValidationRules = {
  name: body("name")
    .trim()
    .notEmpty()
    .withMessage("Kategori adı boş bırakılamaz.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Kategori adı en az 2, en fazla 50 karakter olmalıdır."),

  description: body("description")
    .trim()
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Açıklama en az 10, en fazla 500 karakter olmalıdır."),
};


module.exports = categoryValidationRules;