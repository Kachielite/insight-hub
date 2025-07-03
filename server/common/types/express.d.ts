import {JwtPayload} from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

export {};
