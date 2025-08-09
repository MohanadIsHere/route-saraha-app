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
import RevokeToken from "../../db/models/revokeToken.model.js";

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
        html: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; min-height: 100vh;">
  <div style="max-width: 580px; margin: auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06); border: 1px solid rgba(255, 255, 255, 0.2); overflow: hidden; position: relative;">
    
    <!-- Animated top border -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c); background-size: 200% 200%; animation: shimmer 3s ease-in-out infinite;"></div>
    
    <style>
      @keyframes shimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3); }
        50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4); }
      }
      .icon-container { animation: pulse 2s ease-in-out infinite; }
      .cta-button:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); }
      .feature:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); }
      .social-link:hover { background: linear-gradient(135deg, #667eea, #764ba2) !important; color: white !important; transform: translateY(-2px); }
      .gradient-text {
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .emoji {
        -webkit-text-fill-color: initial;
        background: none;
      }
    </style>
    
    <!-- Header Section -->
    <div style="padding: 48px 40px 32px; text-align: center;">
      <div class="icon-container" style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);">
        <svg style="width: 36px; height: 36px; stroke: white; stroke-width: 3; fill: none;" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <h1 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 8px;">
        <span class="gradient-text">Welcome, ${
          name.split(" ")[0]
        }</span> <span class="emoji">👋</span><span class="gradient-text">!</span>
      </h1>
      <p style="font-size: 16px; color: #64748b; font-weight: 500;">Your journey begins now</p>
    </div>
    
    <!-- Content Section -->
    <div style="padding: 0 40px 40px;">
      <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px; text-align: center;">
        We're thrilled to have you join <strong style="font-weight: 600; color: #1a202c;">Route-Saraha-App</strong>! 
        Your account has been successfully created using Google Sign-In, and you're all set to explore our amazing features.
      </p>
      
      <!-- Divider -->
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 32px 0;"></div>
    </div>
    
    <!-- Footer Section -->
    <div style="padding: 0 40px 32px; text-align: center;">
      <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">
        Need help? Feel free to reach out to our support team anytime.
      </p>
      
      <!-- Social Links -->
      <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 16px;">
        <a href="#" class="social-link" style="width: 40px; height: 40px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #64748b; transition: all 0.3s ease; border: 1px solid rgba(226, 232, 240, 0.8);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
          </svg>
        </a>
        <a href="#" class="social-link" style="width: 40px; height: 40px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #64748b; transition: all 0.3s ease; border: 1px solid rgba(226, 232, 240, 0.8);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
          </svg>
        </a>
        <a href="#" class="social-link" style="width: 40px; height: 40px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #64748b; transition: all 0.3s ease; border: 1px solid rgba(226, 232, 240, 0.8);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>
      
      <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
        © 2025 Route-Saraha-App. All rights reserved.
      </p>
    </div>
  </div>
</div>`,
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
export const logout = async (req, res, next) => {
  try {
    await RevokeToken.create({
      jti: req?.jti,
      userId: req?.user?._id,
    });

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
