import User from "../db/models/user.model.js";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_SECRET_ADMIN,
} from "../config/env.js";
import { verifyToken } from "../utils/token/token.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers || {};

    if (!authorization) {
      const error = new Error("Authorization header is required");
      error.status = 401;
      throw error;
    }

    const [pre, token] = authorization.split(" ");

    if (!pre || !token) {
      const error = new Error("Invalid token");
      error.status = 400;
      throw error;
    }

    let signature = "";
    if (pre.toLowerCase() === "bearer") {
      signature = JWT_ACCESS_TOKEN_SECRET;
    } else if (pre.toLowerCase() === "admin") {
      signature = JWT_ACCESS_TOKEN_SECRET_ADMIN;
    } else {
      const error = new Error("Invalid prefix");
      error.status = 400;
      throw error;
    }

    const payload = verifyToken({ token, secret: signature });

    const user = await User.findOne({ email: payload.email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
