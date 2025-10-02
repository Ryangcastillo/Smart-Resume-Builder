// Authentication Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface RefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
}