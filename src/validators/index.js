const productValidationRules = require("./productValidator");
const userValidationRules = require("./userValidator");
const categoryValidationRules = require("./categoryValidator");
const validate = require("./validatorMiddleware");

const validateRegistration = [
  userValidationRules.email,
  userValidationRules.password,
  validate,
];

const validateLogin = [userValidationRules.email, validate];

const validateProduct = [
  productValidationRules.name,
  productValidationRules.price,
  productValidationRules.description,
  productValidationRules.stock,
  productValidationRules.category,
  validate,
];

const validateCategory = [
  categoryValidationRules.name,
  categoryValidationRules.description,
  validate,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateCategory,
};
