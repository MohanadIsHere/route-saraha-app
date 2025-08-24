import dotenv from "dotenv";
import path from "node:path";
import process from "process";
dotenv.config({ path: path.resolve("./.env") });

export const {
  DB_URI,
  NODE_ENV,
  PORT,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_SECRET_ADMIN,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  ENCRYPTION_KEY,
  ENCRYPTION_KEY_ADMIN,
  EMAIL,
  PASSWORD,
  SALT_ROUNDS,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;
