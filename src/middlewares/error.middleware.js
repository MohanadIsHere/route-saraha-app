import { NODE_ENV } from "../config/env.js";

const errorMiddleware = (err, req, res) => {
  try {
    let error = { ...err };
    error.message = err.message;

    // Mongoose CastError (bad ObjectId)
    if (err.name === "CastError") {
      const message = "Resource not found";
      error = new Error(message);
      error.statusCode = 404;
    }

    // Mongoose duplicate key
    else if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`;
      error = new Error(message);
      error.statusCode = 409; // Conflict is more appropriate than 400
    }

    // Mongoose validation error
    else if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    // JWT token expired
    else if (err.name === "TokenExpiredError") {
      const message = "Your token has expired";
      error = new Error(message);
      error.statusCode = 401;
    }

    // JWT invalid token
    else if (err.name === "JsonWebTokenError") {
      const message = "Invalid token";
      error = new Error(message);
      error.statusCode = 401;
    }

    // Log errors for debugging (don't log in production)
    if (NODE_ENV !== "production") {
      console.error("Error:", {
        message: error.message,
        stack: err.stack,
        statusCode: error.statusCode,
      });
    }

    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error",
      success: false,
      ...(error.errors && { errors: error.errors }),
      ...(NODE_ENV === "development" && { stack: err.stack }),
    });
  } catch (error) {
    console.error("Error in error middleware:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
export default errorMiddleware;
