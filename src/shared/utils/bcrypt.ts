import * as bcrypt from "bcryptjs";

export const generatePasswordHash = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);
  return hashed;
};

export const comparePassword = (
  hashedPassword: string,
  password: string,
): boolean => {
  const isMatched = bcrypt.compareSync(password, hashedPassword);
  return isMatched;
};
