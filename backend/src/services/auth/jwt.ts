import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config';
import { JWTPayload, User } from './types';

export class JWTService {
  private static jwtSecret = config.auth.jwtSecret;
  private static jwtExpire = config.auth.jwtExpire;
  private static bcryptRounds = config.auth.bcryptRounds;

  /**
   * Generate access token for user
   */
  static generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpire,
      issuer: 'smart-resume-builder',
      audience: 'smart-resume-builder-users',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      type: 'refresh',
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '30d', // Refresh tokens last longer
      issuer: 'smart-resume-builder',
      audience: 'smart-resume-builder-users',
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'smart-resume-builder',
        audience: 'smart-resume-builder-users',
      }) as JWTPayload;

      if (decoded.type === 'refresh') {
        throw new Error('Refresh token used as access token');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'smart-resume-builder',
        audience: 'smart-resume-builder-users',
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Access token used as refresh token');
      }

      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate tokens for user
   */
  static generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user.id),
      expiresIn: this.parseExpiresIn(this.jwtExpire),
    };
  }

  /**
   * Parse expires in string to seconds
   */
  private static parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      case 's': return value;
      default: return 3600;
    }
  }
}