import User, { providers } from "../../db/models/user.model.js";
import { generateToken, verifyToken } from "../../utils/token/token.js";
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
      await cloudinary.uploader.upload(req?.file?.path, {
        folder: `route-saraha-app/users/${email}`,
        filename_override: `${name} profile picture`,
        use_filename: true,
        public_id: `${email} profile picture`,
      });
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

    const link = `http://localhost:3000/auth/verify-email?token=${accessToken}`;

    eventEmitter.emit("sendEmail", {
      from: `"Saraha App" <${EMAIL}>`,
      to: email,
      subject: "Verify your email – Route-Saraha-App",
      html: `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f6fa; padding: 40px;">
      <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); padding: 32px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Email_Icon.svg/768px-Email_Icon.svg.png" alt="Email" style="width: 60px; height: 60px;" />
        </div>
        <h1 style="font-size: 22px; color: #222; text-align: center;">Confirm your email</h1>
        <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
          Welcome to <b>Route-Saraha-App</b>. Please verify your email to activate your account.
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${link}" style="background-color: #1d72b8; color: #fff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 13px; color: #777; text-align: center;">
          If you didn’t request this, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          © 2025 Route-Saraha-App. All rights reserved.
        </p>
      </div>
    </div>
  `,
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
    const { email, password } = req.body || {};

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
        profilePicture: {
          secure_url: picture,
          display_name: nanoid(),
          public_id: nanoid(),
        },
        provider: providers.google,
      });

      // Send welcome email for first-time Google signup
      eventEmitter.emit("sendEmail", {
        from: `"Route-Saraha-App" <${EMAIL}>`,
        to: email,
        subject: "Welcome to Route-Saraha-App",
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f6fa; padding: 40px;">
            <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); padding: 32px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Check_green_icon.svg/1024px-Check_green_icon.svg.png" alt="Welcome" style="width: 60px; height: 60px;" />
              </div>
              <h1 style="font-size: 22px; color: #222; text-align: center;">Welcome, ${
                name.split(" ")[0]
              } 👋 !</h1>
              <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
                We're glad to have you at <b>Route-Saraha-App</b>. Your account has been created successfully using Google Sign-In.
              </p>
              <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
                You can now log in anytime and start using all features.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
              <p style="font-size: 12px; color: #aaa; text-align: center;">
                © 2025 Route-Saraha-App. All rights reserved.
              </p>
            </div>
          </div>
        `,
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

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      const error = new Error("Token is required");
      error.statusCode = 400;
      throw error;
    }

    const payload = verifyToken({ token, secret: JWT_ACCESS_TOKEN_SECRET });
    const user = await User.findOne({ email: payload.email, confirmed: false });

    if (!user) {
      const error = new Error("User not found or already confirmed");
      error.statusCode = 404;
      throw error;
    }

    user.confirmed = true;
    await user.save();

    eventEmitter.emit("sendEmail", {
      from: `"Route-Saraha-App" <${EMAIL}>`,
      to: user?.email,
      subject: "Welcome to Route-Saraha-App",
      html: `
          <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f6fa; padding: 40px;">
            <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); padding: 32px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Check_green_icon.svg/1024px-Check_green_icon.svg.png" alt="Welcome" style="width: 60px; height: 60px;" />
              </div>
              <h1 style="font-size: 22px; color: #222; text-align: center;">Welcome, ${
                user.name.split(" ")[0]
              } 👋 !</h1>
              <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
                We're glad to have you at <b>Route-Saraha-App</b>. Your account has been verified successfully.
              </p>
              <p style="font-size: 15px; color: #444; text-align: center; margin-bottom: 28px;">
                You can now log in anytime and start using all features.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
              <p style="font-size: 12px; color: #aaa; text-align: center;">
                © 2025 Route-Saraha-App. All rights reserved.
              </p>
            </div>
          </div>
        `,
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};
