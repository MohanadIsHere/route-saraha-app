import bcrypt from "bcrypt";
export const hashData = async ({ plainText, saltRounds } = {}) => {
  return await bcrypt.hash(plainText, saltRounds);
}
export const compareData = async ({ plainText, hash } = {}) => {
  return await bcrypt.compare(plainText, hash);
}