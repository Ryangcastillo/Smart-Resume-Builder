import { NextFunction, Request, Response } from 'express';
import { JWTService } from '../services/auth/jwt';
import { AuthService } from '../services/auth/service';
import { AuthRequest } from '../services/auth/types';
import { logger } from '../logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens
 */
export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Allow unauthenticated access to public endpoints
    if (req.path.startsWith('/api/auth') || req.path === '/health' || req.path === '/api/auth/login') {
      return next();
    }

    // Extract token from Authorization header
    const authHeader = (req.headers as any).authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Invalid token format.'
      });
    }

    // Verify token
    const decoded = JWTService.verifyAccessToken(token);

    // Get user from database
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Access denied. User not found.'
      });
    }

    // Validate user session
    const isValidSession = await AuthService.validateSession(user.id);
    if (!isValidSession) {
      return res.status(401).json({
        error: 'Access denied. Invalid session.'
      });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);

    if (error instanceof Error) {
      return res.status(401).json({
        error: 'Access denied. ' + error.message
      });
    }

    return res.status(401).json({
      error: 'Access denied. Invalid token.'
    });
  }
}

/**
 * Optional authentication middleware for endpoints that work with or without auth
 */
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = (req.headers as any).authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If token is provided, verify it
    authMiddleware(req, res, next);
  } else {
    // No token provided, continue without user
    next();
  }
}
