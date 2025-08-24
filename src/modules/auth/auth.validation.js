import joi from "joi";

export const signupValidationSchema = {
  body: joi
    .object({
      name: joi.string().required().min(3).max(60).messages({
        "string.min": "Name must be at least 3 characters long",
        "string.max": "Name must be at most 60 characters long",
        "any.required": "Name is required",
      }),
      email: joi.string().email().required().messages({
        "any.required": "Email is required",
      }),
      password: joi.string().required().messages({
        "any.required": "Password is required",
      }),
      confirmPassword: joi
        .string()
        .required()
        .valid(joi.ref("password"))
        .messages({
          "any.required": "Confirm password is required",
          "any.only": "Confirm password does not match",
        }),
      phone: joi.string().required().messages({
        "any.required": "Phone number is required",
      }),
      dob: joi.date().required().messages({
        "any.required": "Date of birth is required",
      }),
    })
    .options({
      abortEarly: false,
    }),
  file: joi
    .object({
      fieldname: joi.string(),
      originalname: joi.string(),
      encoding: joi.string(),
      mimetype: joi.string(),
      destination: joi.string(),
      filename: joi.string(),
      path: joi.string(),
      size: joi.number().positive(),
    })
    .required()
    .options({ abortEarly: false })
    .messages({
      "any.required": "Image is required",
    }),
};

export const signinValidationSchema = {
  body: joi
    .object({
      email: joi.string().email().messages({
        "any.required": "Email is required",
      }),
      password: joi.string().messages({
        "any.required": "Password is required",
      }),
    })
    .required()
    .options({
      abortEarly: false,
    }),
};
export const googleAuthValidationSchema = {
  body: joi
    .object({
      idToken: joi.string().required().messages({
        "any.required": "Id token is required",
      }),
      dob: joi.date().required().messages({
        "any.required": "Date of birth is required",
      }),
      phone: joi.string().required().messages({
        "any.required": "Phone number is required",
      }),
    })
    .options({ abortEarly: false }),
};
export const verifyEmailValidationSchema = {
  query: joi
    .object({
      token: joi.string().required().messages({
        "any.required": "Token is required",
      }),
    })
    .options({ abortEarly: false }),
};
