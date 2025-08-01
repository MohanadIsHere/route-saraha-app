import User from "../../db/models/user.model.js";
import sendEmail from "../../utils/sendEmail.util.js";
import { generateToken } from "../../utils/token/token.js";
import {
  EMAIL,
  ENCRYPTION_KEY,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_TOKEN_SECRET,
  SALT_ROUNDS,
} from "../../config/env.js";
import { compare, hash } from "../../utils/hashing/hashing.js";
import { encrypt } from "../../utils/encryption/encryption.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (await User.findOne({ email })) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hash({
      plainText: password,
      saltRounds: Number(SALT_ROUNDS),
    });
    const encryptedPhone = encrypt({
      plainText: phone,
      secret: ENCRYPTION_KEY,
    });

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      phone: encryptedPhone,
    });

    const accessToken = generateToken({
      payload: { email },
      secret: JWT_ACCESS_TOKEN_SECRET,
      options: { expiresIn: JWT_EXPIRES_IN },
    });
    const refreshToken = generateToken({
      payload: { email },
      secret: JWT_REFRESH_TOKEN_SECRET,
      options: { expiresIn: JWT_EXPIRES_IN },
    });

    const link = `http://localhost:3000/users/verify-email?token=${accessToken}`;

    await sendEmail({
      from: `"Saraha App" <${EMAIL}>`,
      to: email,
      subject: "Verify your email – route-saraha-app",
      text: "Click the link below to verify your email.",
      html: `<div><a href="${link}">Verify Email</a></div>`,
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

    const isPasswordValid = await compare({
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
      options: { expiresIn: JWT_EXPIRES_IN },
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
