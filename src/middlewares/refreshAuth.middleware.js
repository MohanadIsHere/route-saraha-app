import User from "../db/models/user.model.js";
import { verifyToken } from "../utils/token/token.js";
import { JWT_REFRESH_TOKEN_SECRET } from "../config/env.js";

export const refreshAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      const error = new Error("authorization is required in headers");
      error.status = 401;
      throw error;
    }

    const [prefix, token] = authorization.split(" ");

    if (!prefix || !token || prefix.toLowerCase() !== "refresh") {
      const error = new Error("Invalid token format");
      error.status = 400;
      throw error;
    }

    const payload = verifyToken({ token, secret: JWT_REFRESH_TOKEN_SECRET });

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
