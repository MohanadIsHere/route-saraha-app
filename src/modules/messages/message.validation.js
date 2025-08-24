import joi from "joi";

export const sendMessageValidationSchema = {
  body: joi
    .object({
      content: joi.string(),
      userId: joi.string().required().messages({
        "any.required": "User Id is required",
      }),
      senderId: joi.string(),
    })
    .options({ abortEarly: false })
    .messages({
      "any.required": "All fields are required",
    }),
};
export const deleteMessageValidationSchema = {
  params: joi
    .object({
      id: joi.string().required().messages({
        "any.required": "Message Id is required",
      }),
    })
    .options({ abortEarly: false })
    .messages({
      "any.required": "Message Id is required",
    }),
};
export const updateMessageValidationSchema = {
  params: joi
    .object({
      id: joi.string().required().messages({
        "any.required": "Message Id is required",
      }),
    })
    .options({ abortEarly: false })
    .messages({
      "any.required": "Message Id is required",
    }),
  body: joi
    .object({
      content: joi.string(),
      attachments: joi.array().items(
        joi.object({
          public_id: joi.string().required(),
          secure_url: joi.string().required(),
          asset_id: joi.string().required(),
        })
      ),
    })
    .options({ abortEarly: false })
    .messages({
      "any.required": "All fields are required",
    }),
};
export const reportMessageValidationSchema = {
  params: joi
    .object({
      id: joi.string().required().messages({
        "any.required": "Message Id is required",
      }),
    })
    .options({ abortEarly: false })
    .messages({
      "any.required": "Message Id is required",
    }),
  body: joi
    .object({
      reason: joi.string().required().messages({
        "any.required": "Reason is required",
      }),
    })
    .options({ abortEarly: false })
    .messages({
      "any.required": "All fields are required",
    }),
};