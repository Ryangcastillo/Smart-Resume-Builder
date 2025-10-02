import { User, LoginCredentials, RegisterData, AuthTokens } from './types';
import { JWTService } from './jwt';
import prisma from '../../database/client';
import { logger } from '../../logger';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await JWTService.hashPassword(userData.password);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Note: In production, you'd store hashed password in a separate auth table
          // For now, we'll use a placeholder since Neon Auth handles password storage
        }
      });

      // Create default user preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          theme: 'light',
          aiSuggestionsEnabled: true,
          emailNotifications: true,
          language: 'en',
        }
      });

      logger.info(`New user registered: ${user.email}`);

      // Generate tokens
      const tokens = JWTService.generateTokens(user);

      return { user, tokens };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid credentials or inactive user');
      }

      // Note: In production with Neon Auth, you'd verify password through their service
      // For now, we'll simulate password verification
      const isPasswordValid = await this.verifyPassword(credentials.email, credentials.password);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      logger.info(`User logged in: ${user.email}`);

      // Generate tokens
      const tokens = JWTService.generateTokens(user);

      return { user, tokens };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      return user;
    } catch (error) {
      logger.error('Get user by email error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates
      });

      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Update user error:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Get user
      const user = await this.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid user or inactive account');
      }

      // Generate new tokens
      const tokens = JWTService.generateTokens(user);

      logger.info(`Token refreshed for user: ${user.email}`);

      return { user, tokens };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify password (placeholder for Neon Auth integration)
   */
  private static async verifyPassword(email: string, password: string): Promise<boolean> {
    // In production, this would integrate with Neon Auth
    // For development, we'll use a simple check
    try {
      // This is a placeholder - in production you'd call Neon Auth API
      // const isValid = await neonAuth.verifyPassword(email, password);

      // For now, accept any password for development
      return true;
    } catch (error) {
      logger.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Validate user session
   */
  static async validateSession(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return Boolean(user && user.isActive);
    } catch (error) {
      logger.error('Session validation error:', error);
      return false;
    }
  }
}