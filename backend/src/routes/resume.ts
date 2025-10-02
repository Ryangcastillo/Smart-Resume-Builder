import { Router, Request, Response } from 'express';
import { ResumeService } from '../services/resume/service';
import { logger } from '../logger';

const router = Router();

/**
 * Get all user resumes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const resumes = await ResumeService.getUserResumes(user.id);
    res.json({ resumes });
  } catch (error) {
    logger.error('Get resumes error:', error);
    res.status(500).json({
      error: 'Failed to fetch resumes'
    });
  }
});

/**
 * Get specific resume by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const resume = await ResumeService.getResumeById(id, user.id);

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    res.json({ resume });
  } catch (error) {
    logger.error('Get resume error:', error);
    res.status(500).json({
      error: 'Failed to fetch resume'
    });
  }
});

/**
 * Create new resume
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const resumeData = req.body;

    // Validate resume data
    const validation = ResumeService.validateResumeData(resumeData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const resume = await ResumeService.createResume(user.id, resumeData);
    res.status(201).json({
      message: 'Resume created successfully',
      resume
    });
  } catch (error) {
    logger.error('Create resume error:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to create resume'
    });
  }
});

/**
 * Update resume
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const updateData = { ...req.body, id };

    // Validate resume data
    const validation = ResumeService.validateResumeData(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const resume = await ResumeService.updateResume(user.id, updateData);
    res.json({
      message: 'Resume updated successfully',
      resume
    });
  } catch (error) {
    logger.error('Update resume error:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update resume'
    });
  }
});

/**
 * Delete resume
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    await ResumeService.deleteResume(id, user.id);
    res.json({
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    logger.error('Delete resume error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to delete resume'
    });
  }
});

/**
 * Set resume as default
 */
router.patch('/:id/default', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const resume = await ResumeService.setDefaultResume(id, user.id);
    res.json({
      message: 'Default resume updated successfully',
      resume
    });
  } catch (error) {
    logger.error('Set default resume error:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to set default resume'
    });
  }
});

/**
 * Get resume variants
 */
router.get('/:id/variants', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const variants = await ResumeService.getResumeVariants(id, user.id);
    res.json({ variants });
  } catch (error) {
    logger.error('Get resume variants error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch resume variants'
    });
  }
});

export default router;