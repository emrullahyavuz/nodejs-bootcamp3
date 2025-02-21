const productValidationRules = require("./productValidator");
const userValidationRules = require("./userValidator");
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
  validate,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
};
