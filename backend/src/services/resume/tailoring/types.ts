// Resume Tailoring Types
export interface JobDescription {
  id?: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  requirements: string[];
  extractedKeywords: string[];
  skillsRequired?: string[];
  industry?: string;
  location?: string;
  salaryRange?: string;
  employmentType?: string;
  experienceLevel?: string;
  companySize?: string;
  benefits?: string[];
  sourceUrl?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TailoringOptions {
  variantType: 'conservative' | 'balanced' | 'aggressive';
  includeKeywords: boolean;
  enhanceDescriptions: boolean;
  prioritizeSkills: boolean;
  customizeSummary: boolean;
  addAchievements: boolean;
  matchTone: boolean;
}

export interface TailoringPrompt {
  systemPrompt: string;
  userPrompt: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface TailoredContent {
  personalInfo?: {
    summary?: string;
  };
  skills?: string[];
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
    achievements?: string[];
  }>;
  keywords?: string[];
  suggestions?: string[];
}

export interface TailoringResult {
  success: boolean;
  tailoredContent?: TailoredContent;
  variantType: string;
  confidence?: number;
  changes?: string[];
  error?: string;
  metadata?: {
    processingTime: number;
    tokensUsed?: number;
    model: string;
    provider: string;
  };
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordDensity: number;
  suggestedKeywords: string[];
  relevanceScore: number;
}

export interface ContentEnhancement {
  originalText: string;
  enhancedText: string;
  improvements: string[];
  keywordsAdded: string[];
  readabilityScore: number;
}