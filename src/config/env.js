import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("./.env") });

export const {
  DB_URI,
  NODE_ENV,
  PORT,
  JWT_ACCESS_TOKEN_SECRET,

  JWT_REFRESH_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  ENCRYPTION_KEY,
  ENCRYPTION_KEY_ADMIN,
  EMAIL,
  PASSWORD,
  SALT_ROUNDS,
} = process.env;
