import { z } from 'zod';

import { IUser } from './user.types';

// Zod schemas
// ------------------------------------------------------------
export const authenticateUserSchema = z.object({
  idToken: z.string().min(1, 'Google token is required'),
});

// Request types - explicitly typed to avoid 'any' inference
// ------------------------------------------------------------
export interface AuthenticateUserRequest {
  idToken: string;
}

export interface AuthenticateUserResponse {
  message: string;
  data?: AuthResult;
}

// Generic types
// ------------------------------------------------------------
export interface AuthResult {
  token: string;
  user: IUser;
}

// Module augmentation for Express
// ------------------------------------------------------------
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
