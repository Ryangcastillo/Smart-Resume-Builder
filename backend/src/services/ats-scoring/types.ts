// ATS Scoring Types
export interface ATSScore {
  overallScore: number;
  keywordScore: number;
  skillsScore: number;
  experienceScore: number;
  formatScore: number;
  educationScore?: number;
  certificationScore?: number;
  readabilityScore: number;
  sectionCompleteness: number;
}

export interface ATSScoringCriteria {
  keywordWeight: number;
  skillsWeight: number;
  experienceWeight: number;
  formatWeight: number;
  educationWeight: number;
  certificationWeight: number;
  readabilityWeight: number;
  sectionWeight: number;
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  variations: string[];
  importance: 'high' | 'medium' | 'low';
}

export interface SectionAnalysis {
  section: string;
  completeness: number;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface ATSRecommendation {
  type: 'keyword' | 'format' | 'content' | 'structure' | 'skills' | 'experience';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: number; // Expected score improvement
}

export interface ATSFeedback {
  score: ATSScore;
  analysis: {
    keywordMatches: KeywordMatch[];
    sectionAnalysis: SectionAnalysis[];
    strengths: string[];
    weaknesses: string[];
    recommendations: ATSRecommendation[];
  };
  benchmark: {
    averageScore: number;
    topScore: number;
    percentile: number;
  };
}

export interface ScoringOptions {
  strictMode?: boolean;
  industry?: string;
  experienceLevel?: string;
  customWeights?: Partial<ATSScoringCriteria>;
}

export interface FormatCheck {
  hasContactInfo: boolean;
  hasSummary: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  properHeadings: boolean;
  consistentFormatting: boolean;
  appropriateLength: boolean;
  noTables: boolean;
  noImages: boolean;
  standardFonts: boolean;
  readableFontSize: boolean;
}

export interface ReadabilityMetrics {
  averageSentenceLength: number;
  averageWordLength: number;
  complexWords: number;
  readabilityScore: number;
  gradeLevel: string;
}