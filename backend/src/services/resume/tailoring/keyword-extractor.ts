import { LMProviderFactory } from '../../lm-provider';
import { logger } from '../../../logger';

export class KeywordExtractor {
  /**
   * Extract keywords from job description using AI
   */
  static async extractKeywordsFromJobDescription(
    jobDescription: string,
    title: string,
    company: string
  ): Promise<{
    technicalSkills: string[];
    softSkills: string[];
    tools: string[];
    certifications: string[];
    industryTerms: string[];
    requirements: string[];
    allKeywords: string[];
  }> {
    try {
      const prompt = this.buildKeywordExtractionPrompt(jobDescription, title, company);
      const result = await LMProviderFactory.generateWithFallback(prompt, {
        temperature: 0.3,
        maxTokens: 800,
      });

      const extractedData = this.parseKeywordResponse(result.response.content);

      return extractedData;
    } catch (error) {
      logger.error('Keyword extraction error:', error);

      // Fallback to basic keyword extraction
      return this.extractKeywordsFallback(jobDescription);
    }
  }

  /**
   * Build prompt for keyword extraction
   */
  private static buildKeywordExtractionPrompt(
    jobDescription: string,
    title: string,
    company: string
  ): string {
    return `Analyze this job posting and extract relevant keywords and phrases.

Job Title: ${title}
Company: ${company}

Job Description:
${jobDescription}

Please extract and categorize the following types of keywords:

1. Technical Skills (programming languages, frameworks, tools, etc.)
2. Soft Skills (communication, leadership, etc.)
3. Tools & Software (specific software, platforms, etc.)
4. Certifications (required or preferred certifications)
5. Industry Terms (domain-specific terminology)
6. Requirements (key requirements and qualifications)

Return the results in this exact JSON format:
{
  "technicalSkills": ["JavaScript", "React", "Node.js"],
  "softSkills": ["Leadership", "Communication"],
  "tools": ["Git", "JIRA", "Slack"],
  "certifications": ["AWS Certified Developer", "PMP"],
  "industryTerms": ["Agile", "DevOps", "Microservices"],
  "requirements": ["5+ years experience", "Bachelor's degree"]
}

Focus on keywords that would be important for ATS systems and resume optimization. Include variations and synonyms where relevant.`;
  }

  /**
   * Parse AI response for keywords
   */
  private static parseKeywordResponse(content: string): {
    technicalSkills: string[];
    softSkills: string[];
    tools: string[];
    certifications: string[];
    industryTerms: string[];
    requirements: string[];
    allKeywords: string[];
  } {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);

      // Ensure all required fields exist
      const result = {
        technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : [],
        softSkills: Array.isArray(data.softSkills) ? data.softSkills : [],
        tools: Array.isArray(data.tools) ? data.tools : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        industryTerms: Array.isArray(data.industryTerms) ? data.industryTerms : [],
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        allKeywords: [],
      };

      // Combine all keywords
      result.allKeywords = [
        ...result.technicalSkills,
        ...result.softSkills,
        ...result.tools,
        ...result.certifications,
        ...result.industryTerms,
        ...result.requirements,
      ];

      return result;
    } catch (error) {
      logger.error('Failed to parse keyword response:', error);
      throw new Error('Invalid response format from AI');
    }
  }

  /**
   * Fallback keyword extraction using regex and text analysis
   */
  private static extractKeywordsFallback(jobDescription: string): {
    technicalSkills: string[];
    softSkills: string[];
    tools: string[];
    certifications: string[];
    industryTerms: string[];
    requirements: string[];
    allKeywords: string[];
  } {
    const text = jobDescription.toLowerCase();

    // Common technical skills patterns
    const technicalSkillsPatterns = [
      /javascript|js|typescript|ts|python|java|c\+\+|c#|php|ruby|go|golang|rust|swift|kotlin/,
      /react|angular|vue|node\.js|express|django|flask|spring|laravel|symfony/,
      /mysql|postgresql|mongodb|redis|elasticsearch|sqlite/,
      /aws|azure|gcp|docker|kubernetes|jenkins|git|github|gitlab/,
      /html|css|sass|scss|bootstrap|tailwind|material-ui|antd/,
      /redux|zustand|mobx|apollo|graphql|rest|api/,
      /linux|unix|windows|macos|ubuntu|centos/,
      /agile|scrum|kanban|jira|confluence|slack|teams/,
    ];

    // Common soft skills
    const softSkillsPatterns = [
      /leadership|management|teamwork|communication|collaboration|problem.solving/,
      /analytical|critical.thinking|creativity|innovation|adaptability/,
      /time.management|organization|planning|strategic|detail.oriented/,
      /presentation|public.speaking|interpersonal|relationship.building/,
      /motivation|enthusiasm|passion|dedication|commitment/,
    ];

    // Common tools and software
    const toolsPatterns = [
      /microsoft.office|excel|word|powerpoint|outlook|teams/,
      /adobe.creative|suite|photoshop|illustrator|figma|sketch|invision/,
      /salesforce|hubspot|zendesk|intercom|freshworks/,
      /tableau|power.bi|looker|google.analytics|mixpanel/,
    ];

    // Extract keywords using patterns
    const technicalSkills = this.extractFromPatterns(text, technicalSkillsPatterns);
    const softSkills = this.extractFromPatterns(text, softSkillsPatterns);
    const tools = this.extractFromPatterns(text, toolsPatterns);

    // Extract certifications
    const certifications = this.extractCertifications(text);

    // Extract industry terms (domain-specific words)
    const industryTerms = this.extractIndustryTerms(text);

    // Extract requirements
    const requirements = this.extractRequirements(text);

    const allKeywords = [
      ...technicalSkills,
      ...softSkills,
      ...tools,
      ...certifications,
      ...industryTerms,
      ...requirements,
    ];

    return {
      technicalSkills,
      softSkills,
      tools,
      certifications,
      industryTerms,
      requirements,
      allKeywords,
    };
  }

  /**
   * Extract keywords using regex patterns
   */
  private static extractFromPatterns(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];

    patterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    });

    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Extract certifications from text
   */
  private static extractCertifications(text: string): string[] {
    const certifications: string[] = [];

    // Common certification patterns
    const certPatterns = [
      /certified?\s+in?\s+[\w\s]+/gi,
      /pmp|cissp|cisa|cism|ceh|security\+|network\+|a\+|comptia/gi,
      /aws.certified|azure.certified|gcp.certified/gi,
      /cfa|cpa|cma|series\s+\d+/gi,
    ];

    certPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => certifications.push(match.trim()));
      }
    });

    return [...new Set(certifications)];
  }

  /**
   * Extract industry-specific terms
   */
  private static extractIndustryTerms(text: string): string[] {
    const terms: string[] = [];

    // Look for capitalized words that might be industry terms
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];

    capitalizedWords.forEach(word => {
      // Filter out common words and short terms
      if (word.length > 3 &&
          word.length < 50 &&
          !this.isCommonWord(word.toLowerCase()) &&
          !terms.includes(word)) {
        terms.push(word);
      }
    });

    return terms.slice(0, 20); // Limit to top 20 terms
  }

  /**
   * Extract requirements and qualifications
   */
  private static extractRequirements(text: string): string[] {
    const requirements: string[] = [];

    // Look for years of experience
    const experienceMatches = text.match(/\d+\+\s*years?\s*(of\s*)?experience?/gi);
    if (experienceMatches) {
      requirements.push(...experienceMatches);
    }

    // Look for degree requirements
    const degreeMatches = text.match(/(bachelor'?s?|master'?s?|phd|doctorate)\s*(degree)?/gi);
    if (degreeMatches) {
      requirements.push(...degreeMatches);
    }

    // Look for specific requirements
    const reqPatterns = [
      /required|must.have|should.have/gi,
      /preferred|nice.to.have|bonus/gi,
      /minimum|at.least/gi,
    ];

    reqPatterns.forEach(pattern => {
      const matches = text.match(new RegExp(`[^.!?]*${pattern.source}[^.!?]*`, 'gi'));
      if (matches) {
        matches.forEach(match => {
          if (match.length > 10 && match.length < 200) {
            requirements.push(match.trim());
          }
        });
      }
    });

    return [...new Set(requirements)].slice(0, 15);
  }

  /**
   * Check if word is a common English word
   */
  private static isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'within',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
      'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
    ]);

    return commonWords.has(word.toLowerCase());
  }

  /**
   * Analyze keyword matches between resume and job description
   */
  static analyzeKeywordMatches(
    resumeKeywords: string[],
    jobKeywords: string[]
  ): {
    matched: string[];
    missing: string[];
    matchPercentage: number;
    recommendations: string[];
  } {
    const resumeLower = resumeKeywords.map(k => k.toLowerCase());
    const jobLower = jobKeywords.map(k => k.toLowerCase());

    const matched = resumeLower.filter(k => jobLower.some(jk => jk.includes(k) || k.includes(jk)));
    const missing = jobLower.filter(jk => !resumeLower.some(rk => rk.includes(jk) || jk.includes(rk)));

    const matchPercentage = jobKeywords.length > 0 ? (matched.length / jobKeywords.length) * 100 : 0;

    const recommendations = [];
    if (matchPercentage < 30) {
      recommendations.push('Consider adding more relevant keywords from the job description');
    }
    if (missing.length > 10) {
      recommendations.push('Focus on incorporating the most important missing keywords');
    }
    if (matched.length < 5) {
      recommendations.push('Your resume may be missing key technical skills mentioned in the job');
    }

    return {
      matched,
      missing,
      matchPercentage: Math.round(matchPercentage * 100) / 100,
      recommendations,
    };
  }
}