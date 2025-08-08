import User, { providers } from "../../db/models/user.model.js";
import { generateToken } from "../../utils/token/token.js";
import {
  EMAIL,
  ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_SECRET,
  SALT_ROUNDS,
} from "../../config/env.js";
import { compareData, hashData } from "../../utils/hashing/hashing.js";
import { encryptData } from "../../utils/encryption/encryption.js";
import { OAuth2Client } from "google-auth-library";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary/cloudinary.js";
import { eventEmitter } from "../../utils/events/eventEmitter.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone, dob } = req.body || {};

    if (await User.findOne({ email })) {
      const error = new Error("Email Already exist");
      error.statusCode = 400;
      throw error;
    }

    const hashed = await hashData({
      plainText: password,
      saltRounds: SALT_ROUNDS,
    });
    const encryptedPhone = encryptData({
      plainText: phone,
      secret: ENCRYPTION_KEY,
    });

    const { secure_url, public_id, display_name } =
      await cloudinary.uploader.upload(req?.file?.path);

    const user = await User.create({
      name,
      email,
      password: hashed,
      phone: encryptedPhone,
      dob: new Date(dob),
      provider: providers.system,
      profilePicture: {
        secure_url,
        public_id,
        display_name,
      },
    });

    const accessToken = generateToken({
      payload: { email },
      secret: JWT_ACCESS_TOKEN_SECRET,
      options: { expiresIn: JWT_EXPIRES_IN },
    });
    const refreshToken = generateToken({
      payload: { email },
      secret: JWT_REFRESH_TOKEN_SECRET,
      options: { expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN },
    });

    const link = `http://localhost:3000/users/verify-email?token=${accessToken}`;

    eventEmitter.emit("sendEmail", {
      from: `"Saraha App" <${EMAIL}>`,
      to: email,
      subject: "Verify your email – Route-Saraha-App",
      text: "Click the link below to verify your email.",
      html: `<div>click here to verify your account : <a href=${link}>verify</a></div>`,
    });

    return res.status(201).json({
      message: "User created successfully, check your email for verification",
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    console.log({ error });
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, confirmed: true });
    if (!user) {
      const error = new Error("email does not exist or not verified");
      error.statusCode = 404;
      throw error;
    }
    if (user.provider !== providers.system) {
      const error = new Error(
        "Cannot signin using system provider , please use the same method that you signed up with the first time"
      );
      error.statusCode = 400;
      throw error;
    }

    const isPasswordValid = await compareData({
      plainText: password,
      hash: user.password,
    });
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 400;
      throw error;
    }

    const accessToken = generateToken({
      payload: { email },
      secret: JWT_ACCESS_TOKEN_SECRET,
      options: { expiresIn: JWT_EXPIRES_IN },
    });
    const refreshToken = generateToken({
      payload: { email },
      secret: JWT_REFRESH_TOKEN_SECRET,
      options: { expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN },
    });

    return res.status(200).json({
      message: "User signed in successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken, dob, phone } = req.body || {};

    const client = new OAuth2Client();

    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    }
    const { name, email, email_verified, picture } = await verify();
    if (!email_verified) {
      const error = new Error("Email not verified");
      error.statusCode = 400;
      throw error;
    }
    let user = await User.findOne({ email });
    if (!user) {
      const hashed = await hashData({
        plainText: nanoid(),
        saltRounds: SALT_ROUNDS,
      });
      const encryptedPhone = encryptData({
        plainText: phone,
        secret: ENCRYPTION_KEY,
      });
      user = await User.create({
        email,
        confirmed: email_verified,
        password: hashed,
        name,
        phone: encryptedPhone,
        dob: new Date(dob),
        profilePicture: picture,
        provider: "google",
      });
    }
    if (user.provider !== providers.google) {
      const error = new Error(
        "Cannot signin using google provider, please use the same method that you signed up with the first time"
      );
      error.statusCode = 400;
      throw error;
    }
    const accessToken = generateToken({
      payload: { email },
      secret: JWT_ACCESS_TOKEN_SECRET,
      options: { expiresIn: JWT_EXPIRES_IN },
    });
    const refreshToken = generateToken({
      payload: { email },
      secret: JWT_REFRESH_TOKEN_SECRET,
      options: { expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN },
    });
    return res.status(200).json({
      message: "User signed in successfully",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
