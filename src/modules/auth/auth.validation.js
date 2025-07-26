import joi from "joi";

export const signupValidationSchema = {
  body: joi
    .object()
    .keys({
      name: joi.string().required().min(3).max(60),
      email: joi.string().email().required(),
      password: joi.string().required().min(6).max(100),
      confirmPassword: joi.string().required().valid(joi.ref("password")),
      phone: joi.string().required().min(10).max(15),
    })
    .required()
    .options({
      abortEarly: false,
    }),
};

export const signinValidationSchema = {
  body: joi
    .object()
    .keys({
      email: joi.string().email().required(),
      password: joi.string().required().min(6).max(100),
    })
    .required()
    .options({
      abortEarly: false,
    }),
};
