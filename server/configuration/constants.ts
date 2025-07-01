import dotenv from 'dotenv';

dotenv.config();

// Environment
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV;

export const Constants = {
  PORT,
  NODE_ENV,
};
