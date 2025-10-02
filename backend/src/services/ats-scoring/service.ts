import {
  ATSScore,
  ATSFeedback,
  KeywordMatch,
  SectionAnalysis,
  ATSRecommendation,
  ScoringOptions,
  ATSScoringCriteria,
  FormatCheck,
  ReadabilityMetrics
} from './types';
import { logger } from '../../logger';

export class ATSScoringService {
  // Default scoring weights
  private static readonly DEFAULT_CRITERIA: ATSScoringCriteria = {
    keywordWeight: 0.30,
    skillsWeight: 0.25,
    experienceWeight: 0.20,
    formatWeight: 0.15,
    educationWeight: 0.05,
    certificationWeight: 0.03,
    readabilityWeight: 0.02,
    sectionWeight: 0.00, // Calculated separately
  };

  /**
   * Score resume against job description
   */
  static async scoreResume(
    resumeContent: string,
    jobKeywords: string[],
    options: ScoringOptions = {}
  ): Promise<ATSFeedback> {
    try {
      const criteria = options.customWeights
        ? { ...this.DEFAULT_CRITERIA, ...options.customWeights }
        : this.DEFAULT_CRITERIA;

      // Perform comprehensive analysis
      const keywordAnalysis = this.analyzeKeywords(resumeContent, jobKeywords);
      const formatCheck = this.checkFormat(resumeContent);
      const readabilityMetrics = this.analyzeReadability(resumeContent);
      const sectionAnalysis = this.analyzeSections(resumeContent);

      // Calculate individual scores
      const keywordScore = this.calculateKeywordScore(keywordAnalysis, criteria.keywordWeight);
      const skillsScore = this.calculateSkillsScore(resumeContent, jobKeywords, criteria.skillsWeight);
      const experienceScore = this.calculateExperienceScore(resumeContent, criteria.experienceWeight);
      const formatScore = this.calculateFormatScore(formatCheck, criteria.formatWeight);
      const educationScore = this.calculateEducationScore(resumeContent, criteria.educationWeight);
      const certificationScore = this.calculateCertificationScore(resumeContent, criteria.certificationWeight);
      const readabilityScore = this.calculateReadabilityScore(readabilityMetrics, criteria.readabilityWeight);

      // Calculate overall score
      const overallScore = Math.round(
        (keywordScore + skillsScore + experienceScore + formatScore +
         educationScore + certificationScore + readabilityScore)
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        keywordAnalysis,
        formatCheck,
        sectionAnalysis,
        scores: {
          keywordScore,
          skillsScore,
          experienceScore,
          formatScore,
          educationScore,
          certificationScore,
          readabilityScore,
          overallScore,
        }
      });

      // Calculate benchmark data (simplified for now)
      const benchmark = {
        averageScore: 75,
        topScore: 95,
        percentile: Math.min(99, Math.round((overallScore / 95) * 100)),
      };

      return {
        score: {
          overallScore,
          keywordScore: Math.round(keywordScore),
          skillsScore: Math.round(skillsScore),
          experienceScore: Math.round(experienceScore),
          formatScore: Math.round(formatScore),
          educationScore: Math.round(educationScore),
          readabilityScore: Math.round(readabilityScore),
        },
        analysis: {
          keywordMatches: keywordAnalysis,
          sectionAnalysis,
          strengths: this.identifyStrengths({
            keywordScore,
            skillsScore,
            experienceScore,
            formatScore,
            overallScore,
          }),
          weaknesses: this.identifyWeaknesses({
            keywordScore,
            skillsScore,
            experienceScore,
            formatScore,
            overallScore,
          }),
          recommendations,
        },
        benchmark,
      };
    } catch (error) {
      logger.error('ATS scoring error:', error);
      throw new Error('Failed to score resume');
    }
  }

  /**
   * Analyze keyword matches
   */
  private static analyzeKeywords(resumeContent: string, jobKeywords: string[]): KeywordMatch[] {
    const resumeLower = resumeContent.toLowerCase();
    const matches: KeywordMatch[] = [];

    jobKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const found = resumeLower.includes(keywordLower);

      // Check for variations
      const variations = this.findKeywordVariations(keywordLower, resumeLower);

      // Determine importance
      const importance = this.determineKeywordImportance(keyword, jobKeywords);

      matches.push({
        keyword,
        found,
        variations,
        importance,
      });
    });

    return matches;
  }

  /**
   * Find keyword variations in resume
   */
  private static findKeywordVariations(keyword: string, resumeContent: string): string[] {
    const variations: string[] = [];

    // Common variations and synonyms
    const variationMap: { [key: string]: string[] } = {
      'manager': ['management', 'managing', 'managed', 'lead', 'leadership'],
      'develop': ['development', 'developed', 'developer', 'developing'],
      'design': ['designed', 'designer', 'designing', 'architecture'],
      'analyze': ['analysis', 'analytical', 'analytics', 'analyzed'],
      'project': ['projects', 'program', 'initiative', 'effort'],
    };

    const keywordVariations = variationMap[keyword] || [];

    keywordVariations.forEach(variation => {
      if (resumeContent.includes(variation)) {
        variations.push(variation);
      }
    });

    return variations;
  }

  /**
   * Determine keyword importance
   */
  private static determineKeywordImportance(keyword: string, allKeywords: string[]): 'high' | 'medium' | 'low' {
    // Technical skills and specific requirements are high importance
    const highImportanceTerms = [
      'javascript', 'python', 'java', 'react', 'node', 'aws', 'azure',
      'manager', 'director', 'lead', 'senior', 'principal', 'architect',
      'experience', 'required', 'must have', 'certified', 'degree'
    ];

    const keywordLower = keyword.toLowerCase();
    if (highImportanceTerms.some(term => keywordLower.includes(term))) {
      return 'high';
    }

    // If keyword appears frequently in job description, it's medium importance
    const frequency = allKeywords.filter(k => k.toLowerCase().includes(keywordLower)).length;
    if (frequency > 1) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Check resume format for ATS compatibility
   */
  private static checkFormat(content: string): FormatCheck {
    return {
      hasContactInfo: this.hasContactInfo(content),
      hasSummary: this.hasSummary(content),
      hasSkills: this.hasSkillsSection(content),
      hasExperience: this.hasExperienceSection(content),
      hasEducation: this.hasEducationSection(content),
      properHeadings: this.hasProperHeadings(content),
      consistentFormatting: this.hasConsistentFormatting(content),
      appropriateLength: this.hasAppropriateLength(content),
      noTables: !this.containsTables(content),
      noImages: !this.containsImages(content),
      standardFonts: true, // We can't detect fonts from text
      readableFontSize: true, // We can't detect font size from text
    };
  }

  /**
   * Analyze text readability
   */
  private static analyzeReadability(content: string): ReadabilityMetrics {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    const averageSentenceLength = words.length / sentences.length;
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Simple readability score (0-100)
    const readabilityScore = Math.max(0, Math.min(100,
      100 - (averageSentenceLength * 2) - (averageWordLength * 5)
    ));

    return {
      averageSentenceLength,
      averageWordLength,
      complexWords: words.filter(w => w.length > 6).length,
      readabilityScore,
      gradeLevel: this.calculateGradeLevel(averageSentenceLength, averageWordLength),
    };
  }

  /**
   * Analyze resume sections
   */
  private static analyzeSections(content: string): SectionAnalysis[] {
    const sections = [
      { name: 'Contact Information', check: () => this.hasContactInfo(content) },
      { name: 'Professional Summary', check: () => this.hasSummary(content) },
      { name: 'Skills', check: () => this.hasSkillsSection(content) },
      { name: 'Work Experience', check: () => this.hasExperienceSection(content) },
      { name: 'Education', check: () => this.hasEducationSection(content) },
    ];

    return sections.map(section => {
      const completeness = section.check() ? 100 : 0;
      const issues = completeness === 0 ? [`Missing ${section.name} section`] : [];
      const suggestions = completeness === 0 ? [`Add a ${section.name} section`] : [];

      return {
        section: section.name,
        completeness,
        score: completeness,
        issues,
        suggestions,
      };
    });
  }

  /**
   * Calculate keyword score
   */
  private static calculateKeywordScore(keywordMatches: KeywordMatch[], weight: number): number {
    const totalKeywords = keywordMatches.length;
    if (totalKeywords === 0) return 0;

    const foundKeywords = keywordMatches.filter(match => match.found).length;
    const baseScore = (foundKeywords / totalKeywords) * 100;

    // Bonus for high-importance keywords
    const highImportanceMatches = keywordMatches.filter(match => match.found && match.importance === 'high').length;
    const highImportanceTotal = keywordMatches.filter(match => match.importance === 'high').length;

    const importanceBonus = highImportanceTotal > 0 ? (highImportanceMatches / highImportanceTotal) * 20 : 0;

    return Math.min(100, baseScore + importanceBonus) * weight;
  }

  /**
   * Calculate skills score
   */
  private static calculateSkillsScore(content: string, jobKeywords: string[], weight: number): number {
    const skillsSection = this.extractSkillsSection(content);
    if (!skillsSection) return 0;

    const resumeSkills = this.extractSkillsFromText(skillsSection);
    const skillMatches = resumeSkills.filter(skill =>
      jobKeywords.some(keyword => keyword.toLowerCase().includes(skill.toLowerCase()) ||
                                 skill.toLowerCase().includes(keyword.toLowerCase()))
    );

    const score = resumeSkills.length > 0 ? (skillMatches.length / resumeSkills.length) * 100 : 0;
    return score * weight;
  }

  /**
   * Calculate experience score
   */
  private static calculateExperienceScore(content: string, weight: number): number {
    const experienceSection = this.extractExperienceSection(content);
    if (!experienceSection) return 0;

    // Check for quantifiable achievements
    const hasNumbers = /\d+%|\d+\s*(years?|months?|days?)|\$\d+|\d+\s*(projects?|clients?|users?)/gi.test(experienceSection);
    const hasActionVerbs = /\b(achieved|improved|increased|decreased|delivered|created|built|designed|developed|implemented|managed|led|directed)\b/gi.test(experienceSection);
    const hasCompanyNames = /\b(at|@)\s+[A-Z][a-z]+/g.test(experienceSection);

    let score = 0;
    if (hasNumbers) score += 30;
    if (hasActionVerbs) score += 35;
    if (hasCompanyNames) score += 35;

    return score * weight;
  }

  /**
   * Calculate format score
   */
  private static calculateFormatScore(formatCheck: FormatCheck, weight: number): number {
    const checks = Object.values(formatCheck);
    const passedChecks = checks.filter(check => check).length;
    const score = (passedChecks / checks.length) * 100;
    return score * weight;
  }

  /**
   * Calculate education score
   */
  private static calculateEducationScore(content: string, weight: number): number {
    const hasEducation = this.hasEducationSection(content);
    const educationSection = this.extractEducationSection(content);

    if (!hasEducation) return 0;

    // Check for degree, institution, dates
    const hasDegree = /\b(bachelor|master|phd|doctorate|associate|certificate)\b/gi.test(educationSection || '');
    const hasInstitution = /\b(university|college|institute|school)\b/gi.test(educationSection || '');
    const hasDates = /\b(19|20)\d{2}\b/g.test(educationSection || '');

    let score = 0;
    if (hasDegree) score += 40;
    if (hasInstitution) score += 30;
    if (hasDates) score += 30;

    return score * weight;
  }

  /**
   * Calculate certification score
   */
  private static calculateCertificationScore(content: string, weight: number): number {
    const certMatches = content.match(/\b(certified|certification|pmp|cissp|cisa|aws|azure|gcp)\b/gi);
    const score = certMatches ? Math.min((certMatches.length / 3) * 100, 100) : 0;
    return score * weight;
  }

  /**
   * Calculate readability score
   */
  private static calculateReadabilityScore(metrics: ReadabilityMetrics, weight: number): number {
    return metrics.readabilityScore * weight;
  }

  /**
   * Generate recommendations based on analysis
   */
  private static generateRecommendations(analysis: any): ATSRecommendation[] {
    const recommendations: ATSRecommendation[] = [];

    // Keyword recommendations
    const missingHighImportance = analysis.keywordAnalysis.filter((match: KeywordMatch) =>
      !match.found && match.importance === 'high'
    );

    if (missingHighImportance.length > 0) {
      recommendations.push({
        type: 'keyword',
        priority: 'high',
        title: 'Add Missing Keywords',
        description: `Your resume is missing ${missingHighImportance.length} high-importance keywords`,
        action: `Add these keywords: ${missingHighImportance.slice(0, 3).map(m => m.keyword).join(', ')}`,
        impact: 15,
      });
    }

    // Format recommendations
    if (analysis.formatCheck.noTables) {
      recommendations.push({
        type: 'format',
        priority: 'medium',
        title: 'Avoid Tables',
        description: 'Tables can confuse ATS systems',
        action: 'Replace tables with bullet points or simple text',
        impact: 5,
      });
    }

    // Section recommendations
    const incompleteSections = analysis.sectionAnalysis.filter((section: SectionAnalysis) =>
      section.completeness < 100
    );

    incompleteSections.forEach((section: SectionAnalysis) => {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        title: `Add ${section.section}`,
        description: `${section.section} is missing from your resume`,
        action: section.suggestions[0] || `Add a ${section.section} section`,
        impact: 10,
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Identify strengths
   */
  private static identifyStrengths(scores: any): string[] {
    const strengths: string[] = [];

    if (scores.keywordScore > 80) {
      strengths.push('Excellent keyword optimization');
    }
    if (scores.skillsScore > 80) {
      strengths.push('Strong skills section alignment');
    }
    if (scores.experienceScore > 80) {
      strengths.push('Well-structured experience section');
    }
    if (scores.formatScore > 80) {
      strengths.push('ATS-friendly formatting');
    }
    if (scores.overallScore > 85) {
      strengths.push('Overall excellent ATS compatibility');
    }

    return strengths;
  }

  /**
   * Identify weaknesses
   */
  private static identifyWeaknesses(scores: any): string[] {
    const weaknesses: string[] = [];

    if (scores.keywordScore < 60) {
      weaknesses.push('Missing important keywords from job description');
    }
    if (scores.skillsScore < 60) {
      weaknesses.push('Skills section needs better job alignment');
    }
    if (scores.experienceScore < 60) {
      weaknesses.push('Experience descriptions could be more ATS-friendly');
    }
    if (scores.formatScore < 60) {
      weaknesses.push('Resume format may not be ATS-optimized');
    }

    return weaknesses;
  }

  // Helper methods for content analysis
  private static hasContactInfo(content: string): boolean {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    return emailPattern.test(content) && phonePattern.test(content);
  }

  private static hasSummary(content: string): boolean {
    return /\b(summary|objective|profile|about)\b/i.test(content) &&
           content.match(/([A-Z][^.!?]*){3,}/) !== null;
  }

  private static hasSkillsSection(content: string): boolean {
    return /\b(skills|competencies|expertise|abilities)\b/i.test(content);
  }

  private static hasExperienceSection(content: string): boolean {
    return /\b(experience|employment|work|career)\b/i.test(content);
  }

  private static hasEducationSection(content: string): boolean {
    return /\b(education|academic|degree|university|college)\b/i.test(content);
  }

  private static hasProperHeadings(content: string): boolean {
    const headings = content.match(/^[A-Z][^:!?]*$/gm);
    return headings !== null && headings.length > 3;
  }

  private static hasConsistentFormatting(content: string): boolean {
    const lines = content.split('\n');
    const bulletPoints = lines.filter(line => line.trim().match(/^[-•*]\s/));
    return bulletPoints.length > 0;
  }

  private static hasAppropriateLength(content: string): boolean {
    const words = content.split(/\s+/).length;
    return words >= 200 && words <= 800;
  }

  private static containsTables(content: string): boolean {
    return /\|\s*[^|]+\s*\|/g.test(content);
  }

  private static containsImages(content: string): boolean {
    return /\[image\]|\.jpg|\.png|\.gif|\.jpeg/i.test(content);
  }

  private static calculateGradeLevel(avgSentenceLength: number, avgWordLength: number): string {
    const grade = (0.39 * avgSentenceLength) + (11.8 * avgWordLength) - 15.59;
    if (grade < 8) return 'Elementary';
    if (grade < 12) return 'High School';
    if (grade < 16) return 'College';
    return 'Graduate';
  }

  private static extractSkillsSection(content: string): string | null {
    const lines = content.split('\n');
    let inSkillsSection = false;
    let skillsContent = '';

    for (const line of lines) {
      if (/\b(skills|competencies|expertise)\b/i.test(line)) {
        inSkillsSection = true;
        skillsContent += line + ' ';
      } else if (inSkillsSection) {
        if (/^\s*$/.test(line) || /\b(experience|education|summary)\b/i.test(line)) {
          break;
        }
        skillsContent += line + ' ';
      }
    }

    return skillsContent.trim() || null;
  }

  private static extractSkillsFromText(text: string): string[] {
    return text
      .split(/[,•·|]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 2 && skill.length < 50);
  }

  private static extractExperienceSection(content: string): string | null {
    const lines = content.split('\n');
    let inExperienceSection = false;
    let experienceContent = '';

    for (const line of lines) {
      if (/\b(experience|employment|work)\b/i.test(line)) {
        inExperienceSection = true;
        experienceContent += line + ' ';
      } else if (inExperienceSection) {
        if (/^\s*$/.test(line) || /\b(education|skills|summary)\b/i.test(line)) {
          break;
        }
        experienceContent += line + ' ';
      }
    }

    return experienceContent.trim() || null;
  }

  private static extractEducationSection(content: string): string | null {
    const lines = content.split('\n');
    let inEducationSection = false;
    let educationContent = '';

    for (const line of lines) {
      if (/\b(education|academic|degree)\b/i.test(line)) {
        inEducationSection = true;
        educationContent += line + ' ';
      } else if (inEducationSection) {
        if (/^\s*$/.test(line) || /\b(experience|skills|summary)\b/i.test(line)) {
          break;
        }
        educationContent += line + ' ';
      }
    }

    return educationContent.trim() || null;
  }
}