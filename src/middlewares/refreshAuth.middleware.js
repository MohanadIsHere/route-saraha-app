import jwt from "jsonwebtoken";
import User from "../db/models/user.model.js";

export const refreshAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    

    if (!authorization) {
      return res.status(400).json({ message: "Token is required in headers" });
    }

    const [prefix, token] = authorization.split(" ");

    if (!prefix || !token || prefix.toLowerCase() !== "refresh") {
      return res.status(400).json({ message: "Invalid refresh token format" });
    }

    const payload = jwt.verify(token, "Mohanad23__#refresh");

    const user = await User.findOne({ email: payload.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log(req.user);
    
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(400).json({ message: "Refresh token expired" });
    }

    return res.status(500).json({ message: error.message, error });
  }
};
