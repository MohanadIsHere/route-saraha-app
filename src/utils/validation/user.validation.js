import joi from "joi";
export const resetPasswordValidationSchema = {
  body: joi
      .object()
      .keys({
        email: joi.string().email().required(),
        otp : joi.string().required().min(6).max(6),
        newPassword: joi.string().required().min(6).max(100),
      })
      .required()
      .options({
        abortEarly: false,
      }),
}