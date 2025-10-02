import express, { Request, Response } from 'express';
import authRoutes from './auth';
import resumeRoutes from './resume';
import uploadRoutes from './upload';

const router = express.Router();

// API info
router.get('/', (_req: Request, res: Response) => res.json({
  message: 'ATS Resume Builder API',
  version: '1.0.0',
  endpoints: {
    auth: '/api/auth/*',
    resumes: '/api/resumes/*',
    upload: '/api/upload/*',
    jobs: '/api/jobs/*',
    applications: '/api/applications/*',
  }
}));

// Auth routes
router.use('/auth', authRoutes);

// Resume routes
router.use('/resumes', resumeRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Job routes (to be implemented)
// router.use('/jobs', jobRoutes);

// Application routes (to be implemented)
// router.use('/applications', applicationRoutes);

export default router;
