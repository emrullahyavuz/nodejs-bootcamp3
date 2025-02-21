const userValidationRules = require("./userValidator");
const validate = require("./validatorMiddleware");

const validateRegistration = [
  userValidationRules.email,
  userValidationRules.password,
  validate,
];

const validateLogin = [userValidationRules.email, validate];

module.exports = {
  validateRegistration,
  validateLogin,
};
