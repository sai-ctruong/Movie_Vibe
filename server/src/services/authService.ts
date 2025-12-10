import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/env';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role }, 
    config.JWT_SECRET, 
    { expiresIn: config.JWT_EXPIRE } as SignOptions
  );
};

export const verifyToken = (token: string): { userId: string; role: string } => {
  return jwt.verify(token, config.JWT_SECRET) as { userId: string; role: string };
};
