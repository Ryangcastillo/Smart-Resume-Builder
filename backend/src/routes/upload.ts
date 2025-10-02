import { Router, Request, Response } from 'express';
import multer from 'multer';
import { FileParserService } from '../services/file-parser/service';
import { logger } from '../logger';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: FileParserService.getMaxFileSize(),
  },
  fileFilter: (req, file, cb) => {
    const supportedTypes = FileParserService.getSupportedFileTypes();
    const isSupported = supportedTypes.some(type =>
      type.mimeType === file.mimetype || type.extensions.some(ext => file.originalname.toLowerCase().endsWith(ext))
    );

    if (isSupported) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Supported types: ${supportedTypes.map(t => t.extensions.join(', ')).join(', ')}`));
    }
  }
});

/**
 * Upload and parse resume file
 */
router.post('/resume', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Parse the uploaded file
    const result = await FileParserService.parseResumeFile(req.file);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        metadata: result.metadata
      });
    }

    // Normalize the extracted data
    const normalizedData = FileParserService.normalizeExtractedData(result.data!);

    res.json({
      message: 'File parsed successfully',
      data: normalizedData,
      metadata: result.metadata
    });
  } catch (error) {
    logger.error('File upload error:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to process uploaded file'
    });
  }
});

/**
 * Get supported file types
 */
router.get('/supported-types', (req: Request, res: Response) => {
  const supportedTypes = FileParserService.getSupportedFileTypes();
  const maxSize = FileParserService.getMaxFileSize();

  res.json({
    supportedTypes,
    maxFileSize: maxSize,
    maxFileSizeMB: Math.round(maxSize / 1024 / 1024)
  });
});

/**
 * Health check for file upload functionality
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'File upload service is running',
    supportedTypes: FileParserService.getSupportedFileTypes().map(t => t.extensions).flat(),
    maxFileSize: FileParserService.getMaxFileSize()
  });
});

export default router;