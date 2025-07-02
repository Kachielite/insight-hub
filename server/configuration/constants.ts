import dotenv from 'dotenv';

dotenv.config();

// Environment
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV;

// JWT
const JWT_SECRET: string = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

export const Constants = {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_TOKEN_EXPIRY,
};
