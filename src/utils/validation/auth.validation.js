import joi from "joi";

export const signupValidationSchema = {
  body: joi
    .object()
    .keys({
      name: joi.string().required().min(3).max(60),
      email: joi.string().email().required(),
      password: joi.string().required().min(6).max(100),
      confirmPassword: joi.string().required().valid(joi.ref("password")),
      phone: joi.string().required(),
      dob: joi.date().required(),
    })
    .options({
      abortEarly: false,
    }),
};

export const signinValidationSchema = {
  body: joi
    .object()
    .keys({
      email: joi.string().email(),
      password: joi.string().min(6).max(100),
    })
    .required()
    .options({
      abortEarly: false,
    }),
};
export const googleAuthValidationSchema = {
  body: joi
    .object()
    .keys({
      idToken: joi.string().required(),
      dob: joi.date().required(),
      phone: joi.string().required(),
    })
    .options({ abortEarly: false }),
};
