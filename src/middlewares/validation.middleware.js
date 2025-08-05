export const validation = (schema) => {
  return async (req, res, next) => {
    const validationErrors = [];

    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key]);

      if (error) {
        validationErrors.push(...error.details); 
      }
    }

    if (validationErrors.length > 0) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.errors = validationErrors.map((detail) => ({
        message: detail.message,
      }));
      return next(err);
    }

    next();
  };
};
