const Joi = require("joi");
const PasswordComplexity = require("joi-password-complexity");

// From validation
exports.formRegisterValidation = (data) => {
  const schema = Joi.object({
    npm_nidn: Joi.number().label("npm_nidn"),
    email: Joi.string().email().required().label("Email"),
    password: PasswordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

// reset password validation
exports.resetPasswordValidation = (data) => {
  const schema = Joi.object({
    password: PasswordComplexity().required().label("Password"),
  });

  return schema.validate(data);
};

// ChangePassword validation
exports.changePasswordValidation = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required().label("Old Password"),
    password: PasswordComplexity().required().label("Password"),
  });

  return schema.validate(data);
};
