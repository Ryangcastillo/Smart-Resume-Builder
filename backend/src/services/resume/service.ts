import { MasterResume, CreateResumeData, UpdateResumeData, ResumeVariant } from './types';
import prisma from '../../database/client';
import { logger } from '../../logger';

export class ResumeService {
  /**
   * Create a new master resume
   */
  static async createResume(userId: string, resumeData: CreateResumeData): Promise<MasterResume> {
    try {
      // If this is set as default, unset other default resumes
      if (resumeData.isDefault) {
        await prisma.masterResume.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const resume = await prisma.masterResume.create({
        data: {
          userId,
          title: resumeData.title,
          personalInfo: resumeData.personalInfo,
          skills: resumeData.skills || [],
          experience: resumeData.experience || [],
          education: resumeData.education || [],
          certifications: resumeData.certifications || [],
          projects: resumeData.projects || [],
          languages: resumeData.languages || [],
          interests: resumeData.interests || [],
          templateId: resumeData.templateId,
          isDefault: resumeData.isDefault || false,
        }
      });

      logger.info(`Resume created: ${resume.id} for user ${userId}`);
      return this.formatResume(resume);
    } catch (error) {
      logger.error('Create resume error:', error);
      throw new Error('Failed to create resume');
    }
  }

  /**
   * Get all resumes for a user
   */
  static async getUserResumes(userId: string): Promise<MasterResume[]> {
    try {
      const resumes = await prisma.masterResume.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' }
        ]
      });

      return resumes.map(resume => this.formatResume(resume));
    } catch (error) {
      logger.error('Get user resumes error:', error);
      throw new Error('Failed to fetch resumes');
    }
  }

  /**
   * Get a specific resume by ID
   */
  static async getResumeById(resumeId: string, userId: string): Promise<MasterResume | null> {
    try {
      const resume = await prisma.masterResume.findFirst({
        where: {
          id: resumeId,
          userId
        }
      });

      return resume ? this.formatResume(resume) : null;
    } catch (error) {
      logger.error('Get resume by ID error:', error);
      return null;
    }
  }

  /**
   * Update a resume
   */
  static async updateResume(userId: string, updateData: UpdateResumeData): Promise<MasterResume> {
    try {
      const { id, ...data } = updateData;

      // If this is set as default, unset other default resumes
      if (data.isDefault) {
        await prisma.masterResume.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const resume = await prisma.masterResume.update({
        where: {
          id,
          userId
        },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      logger.info(`Resume updated: ${resume.id}`);
      return this.formatResume(resume);
    } catch (error) {
      logger.error('Update resume error:', error);
      throw new Error('Failed to update resume');
    }
  }

  /**
   * Delete a resume
   */
  static async deleteResume(resumeId: string, userId: string): Promise<boolean> {
    try {
      // Check if resume exists and belongs to user
      const resume = await prisma.masterResume.findFirst({
        where: {
          id: resumeId,
          userId
        }
      });

      if (!resume) {
        throw new Error('Resume not found');
      }

      // Delete associated variants first (cascade should handle this, but being explicit)
      await prisma.resumeVariant.deleteMany({
        where: { masterResumeId: resumeId }
      });

      // Delete the resume
      await prisma.masterResume.delete({
        where: { id: resumeId }
      });

      logger.info(`Resume deleted: ${resumeId}`);
      return true;
    } catch (error) {
      logger.error('Delete resume error:', error);
      throw new Error('Failed to delete resume');
    }
  }

  /**
   * Get user's default resume
   */
  static async getDefaultResume(userId: string): Promise<MasterResume | null> {
    try {
      const resume = await prisma.masterResume.findFirst({
        where: {
          userId,
          isDefault: true
        }
      });

      return resume ? this.formatResume(resume) : null;
    } catch (error) {
      logger.error('Get default resume error:', error);
      return null;
    }
  }

  /**
   * Set a resume as default
   */
  static async setDefaultResume(resumeId: string, userId: string): Promise<MasterResume> {
    try {
      // Unset all other default resumes
      await prisma.masterResume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });

      // Set the specified resume as default
      const resume = await prisma.masterResume.update({
        where: {
          id: resumeId,
          userId
        },
        data: { isDefault: true }
      });

      logger.info(`Default resume set: ${resumeId}`);
      return this.formatResume(resume);
    } catch (error) {
      logger.error('Set default resume error:', error);
      throw new Error('Failed to set default resume');
    }
  }

  /**
   * Get resume variants
   */
  static async getResumeVariants(resumeId: string, userId: string): Promise<ResumeVariant[]> {
    try {
      // First verify the resume belongs to the user
      const resume = await prisma.masterResume.findFirst({
        where: {
          id: resumeId,
          userId
        }
      });

      if (!resume) {
        throw new Error('Resume not found');
      }

      const variants = await prisma.resumeVariant.findMany({
        where: { masterResumeId: resumeId },
        include: {
          jobDescription: true,
          scoringResults: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return variants.map(variant => ({
        id: variant.id,
        masterResumeId: variant.masterResumeId,
        jobDescriptionId: variant.jobDescriptionId,
        tailoredContent: variant.tailoredContent as any,
        variantType: variant.variantType as any,
        atsScore: variant.atsScore,
        feedback: variant.feedback as any,
        version: variant.version,
        isGenerated: variant.isGenerated,
        createdAt: variant.createdAt.toISOString(),
        updatedAt: variant.updatedAt.toISOString(),
      }));
    } catch (error) {
      logger.error('Get resume variants error:', error);
      throw new Error('Failed to fetch resume variants');
    }
  }

  /**
   * Format resume data from database
   */
  private static formatResume(resume: any): MasterResume {
    return {
      id: resume.id,
      userId: resume.userId,
      title: resume.title,
      personalInfo: resume.personalInfo,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      certifications: resume.certifications,
      projects: resume.projects,
      languages: resume.languages,
      interests: resume.interests,
      templateId: resume.templateId,
      isDefault: resume.isDefault,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    };
  }

  /**
   * Validate resume data
   */
  static validateResumeData(data: CreateResumeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Resume title is required');
    }

    if (!data.personalInfo?.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!data.personalInfo?.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!data.personalInfo?.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email)) {
      errors.push('Valid email is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}