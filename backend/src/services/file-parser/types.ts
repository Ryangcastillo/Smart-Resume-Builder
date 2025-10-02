// File Parser Types
export interface ParsedResumeData {
  personalInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedIn?: string;
    website?: string;
  };
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description: string;
    location?: string;
  }>;
  education: Array<{
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
}

export interface FileUploadResult {
  success: boolean;
  data?: ParsedResumeData;
  error?: string;
  metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    extractedText?: string;
  };
}

export interface ParserOptions {
  extractContactInfo?: boolean;
  extractSkills?: boolean;
  extractExperience?: boolean;
  extractEducation?: boolean;
  extractCertifications?: boolean;
  extractProjects?: boolean;
  cleanText?: boolean;
  language?: string;
}

export interface TextExtractionResult {
  text: string;
  metadata: {
    pages?: number;
    author?: string;
    title?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}