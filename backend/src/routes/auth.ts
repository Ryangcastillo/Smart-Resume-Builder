import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth/service';
import { JWTService } from '../services/auth/jwt';
import { logger } from '../logger';

const router = Router();

/**
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { user, tokens } = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    });
  } catch (error) {
    logger.error('Registration error:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { user, tokens } = await AuthService.login({
      email,
      password,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    });
  } catch (error) {
    logger.error('Login error:', error);

    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    const { user, tokens } = await AuthService.refreshToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);

    if (error instanceof Error) {
      return res.status(401).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // User should be attached by auth middleware
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Not authenticated'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * Update user profile
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    // User should be attached by auth middleware
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Not authenticated'
      });
    }

    const { firstName, lastName, avatar } = req.body;

    const updatedUser = await AuthService.updateUser(user.id, {
      firstName,
      lastName,
      avatar,
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * Logout (client-side should discard tokens)
 */
router.post('/logout', (req: Request, res: Response) => {
  // For stateless JWT, logout is handled client-side
  // In production, you might want to maintain a token blacklist
  res.json({
    message: 'Logout successful'
  });
});

export default router;