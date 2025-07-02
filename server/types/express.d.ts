import {JwtPayload} from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: string | JwtPayload;
        }
    }
}

// Also declare it as a module augmentation
declare module "express-serve-static-core" {
    interface Request {
        user?: string | JwtPayload;
    }
}

export {};
