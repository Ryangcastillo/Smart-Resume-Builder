import { FileUploadResult, ParsedResumeData, ParserOptions } from './types';
import { PDFParser } from './pdf-parser';
import { DOCXParser } from './docx-parser';
import { logger } from '../../logger';

export class FileParserService {
  /**
   * Supported file types
   */
  private static readonly SUPPORTED_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc']
  };

  /**
   * Maximum file size (10MB)
   */
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * Parse uploaded file and extract resume data
   */
  static async parseResumeFile(
    file: Express.Multer.File,
    options: ParserOptions = {}
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      let resumeData: ParsedResumeData;

      // Parse based on file type
      if (file.mimetype === 'application/pdf') {
        resumeData = await PDFParser.parseResume(file.buffer, options);
      } else if (file.mimetype.includes('document')) {
        resumeData = await DOCXParser.parseResume(file.buffer, options);
      } else {
        return {
          success: false,
          error: `Unsupported file type: ${file.mimetype}`
        };
      }

      // Validate extracted data
      const dataValidation = this.validateExtractedData(resumeData);
      if (!dataValidation.valid) {
        return {
          success: false,
          error: `Failed to extract valid resume data: ${dataValidation.error}`
        };
      }

      return {
        success: true,
        data: resumeData,
        metadata: {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        }
      };
    } catch (error) {
      logger.error('File parsing error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse file'
      };
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check file type
    if (!this.SUPPORTED_TYPES[file.mimetype as keyof typeof this.SUPPORTED_TYPES]) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.mimetype}. Supported types: PDF, DOCX`
      };
    }

    // Check if file buffer exists
    if (!file.buffer || file.buffer.length === 0) {
      return {
        valid: false,
        error: 'File buffer is empty'
      };
    }

    return { valid: true };
  }

  /**
   * Validate extracted resume data
   */
  private static validateExtractedData(data: ParsedResumeData): { valid: boolean; error?: string } {
    // Check if we have at least some basic information
    const hasBasicInfo = data.personalInfo.firstName ||
                        data.personalInfo.lastName ||
                        data.personalInfo.email ||
                        data.skills.length > 0 ||
                        data.experience.length > 0 ||
                        data.education.length > 0;

    if (!hasBasicInfo) {
      return {
        valid: false,
        error: 'No recognizable resume content found in file'
      };
    }

    // Validate email format if present
    if (data.personalInfo.email && !this.isValidEmail(data.personalInfo.email)) {
      return {
        valid: false,
        error: 'Invalid email format found in resume'
      };
    }

    return { valid: true };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get supported file types
   */
  static getSupportedFileTypes(): Array<{ mimeType: string; extensions: string[] }> {
    return Object.entries(this.SUPPORTED_TYPES).map(([mimeType, extensions]) => ({
      mimeType,
      extensions
    }));
  }

  /**
   * Get maximum file size in bytes
   */
  static getMaxFileSize(): number {
    return this.MAX_FILE_SIZE;
  }

  /**
   * Clean and normalize extracted data
   */
  static normalizeExtractedData(data: ParsedResumeData): ParsedResumeData {
    return {
      personalInfo: {
        firstName: data.personalInfo.firstName?.trim(),
        lastName: data.personalInfo.lastName?.trim(),
        email: data.personalInfo.email?.trim().toLowerCase(),
        phone: data.personalInfo.phone?.trim(),
        address: data.personalInfo.address?.trim(),
        linkedIn: data.personalInfo.linkedIn?.trim(),
        website: data.personalInfo.website?.trim(),
      },
      summary: data.summary?.trim(),
      skills: [...new Set(data.skills.map(skill => skill.trim()))], // Remove duplicates
      experience: data.experience.map(exp => ({
        ...exp,
        company: exp.company.trim(),
        position: exp.position.trim(),
        description: exp.description.trim(),
        location: exp.location?.trim(),
      })),
      education: data.education.map(edu => ({
        ...edu,
        institution: edu.institution.trim(),
        degree: edu.degree?.trim(),
        fieldOfStudy: edu.fieldOfStudy?.trim(),
      })),
      certifications: data.certifications.map(cert => ({
        ...cert,
        name: cert.name.trim(),
        issuer: cert.issuer?.trim(),
      })),
      projects: data.projects?.map(proj => ({
        ...proj,
        name: proj.name.trim(),
        description: proj.description.trim(),
      }))
    };
  }

  /**
   * Merge parsed data with existing resume data
   */
  static mergeWithExistingData(
    parsedData: ParsedResumeData,
    existingData?: Partial<ParsedResumeData>
  ): ParsedResumeData {
    if (!existingData) {
      return this.normalizeExtractedData(parsedData);
    }

    return {
      personalInfo: { ...existingData.personalInfo, ...parsedData.personalInfo },
      summary: parsedData.summary || existingData.summary,
      skills: [...new Set([...(existingData.skills || []), ...parsedData.skills])],
      experience: [...(existingData.experience || []), ...parsedData.experience],
      education: [...(existingData.education || []), ...parsedData.education],
      certifications: [...(existingData.certifications || []), ...parsedData.certifications],
      projects: [...(existingData.projects || []), ...(parsedData.projects || [])]
    };
  }
}