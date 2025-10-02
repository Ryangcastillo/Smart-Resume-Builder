import { Request, Response, Router } from 'express';
import { logger } from '../logger';
import { ResumeService } from '../services/resume/service';

const router = Router();

/**
 * Get all user resumes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    const resumes = await ResumeService.getUserResumes(user.id);
    res.json({ resumes });
    return;
  } catch (error) {
    logger.error('Get resumes error:', error);
    res.status(500).json({
      error: 'Failed to fetch resumes',
    });
    return;
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
        error: 'Authentication required',
      });
    }

    const resume = await ResumeService.getResumeById(id, user.id);

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found',
      });
    }

    res.json({ resume });
    return;
  } catch (error) {
    logger.error('Get resume error:', error);
    res.status(500).json({
      error: 'Failed to fetch resume',
    });
    return;
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
        error: 'Authentication required',
      });
    }

    const resumeData = req.body;

    // Validate resume data
    const validation = ResumeService.validateResumeData(resumeData);
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
      return;
    }

    const resume = await ResumeService.createResume(user.id, resumeData);
    res.status(201).json({
      message: 'Resume created successfully',
      resume,
    });
    return;
  } catch (error) {
    logger.error('Create resume error:', error);

    if (error instanceof Error) {
      res.status(400).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to create resume',
    });
    return;
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
        error: 'Authentication required',
      });
    }

    const updateData = { ...req.body, id };

    // Validate resume data
    const validation = ResumeService.validateResumeData(updateData);
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
      return;
    }

    const resume = await ResumeService.updateResume(user.id, updateData);
    res.json({
      message: 'Resume updated successfully',
      resume,
    });
    return;
  } catch (error) {
    logger.error('Update resume error:', error);

    if (error instanceof Error) {
      res.status(400).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to update resume',
    });
    return;
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
        error: 'Authentication required',
      });
    }

    await ResumeService.deleteResume(id, user.id);
    res.json({
      message: 'Resume deleted successfully',
    });
    return;
  } catch (error) {
    logger.error('Delete resume error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to delete resume',
    });
    return;
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
        error: 'Authentication required',
      });
    }

    const resume = await ResumeService.setDefaultResume(id, user.id);
    res.json({
      message: 'Default resume updated successfully',
      resume,
    });
    return;
  } catch (error) {
    logger.error('Set default resume error:', error);

    if (error instanceof Error) {
      res.status(400).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to set default resume',
    });
    return;
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
        error: 'Authentication required',
      });
    }

    const variants = await ResumeService.getResumeVariants(id, user.id);
    res.json({ variants });
    return;
  } catch (error) {
    logger.error('Get resume variants error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to fetch resume variants',
    });
    return;
  }
});

export default router;
