import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../../config/env.js";
export const hash = async ({ plainText, saltRounds } = {}) => {
  return await bcrypt.hash(plainText, saltRounds);
};
export const compare = async ({ plainText, hash } = {}) => {
  return await bcrypt.compare(plainText, hash);
};
