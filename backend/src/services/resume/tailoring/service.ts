import { MasterResume, ResumeVariant, TailoringOptions, TailoringResult, TailoredContent } from './types';
import { KeywordExtractor } from './keyword-extractor';
import { LMProviderFactory } from '../../lm-provider';
import { logger } from '../../../logger';

export class ResumeTailoringService {
  /**
   * Generate tailored resume variants for a job description
   */
  static async generateTailoredVariants(
    resume: MasterResume,
    jobDescription: string,
    jobTitle: string,
    companyName: string,
    options: TailoringOptions = { variantType: 'balanced' }
  ): Promise<TailoringResult[]> {
    try {
      // Extract keywords from job description
      const keywordData = await KeywordExtractor.extractKeywordsFromJobDescription(
        jobDescription,
        jobTitle,
        companyName
      );

      // Generate different variants based on type
      const variants = [];

      if (options.variantType === 'conservative' || options.variantType === 'balanced') {
        variants.push(await this.generateConservativeVariant(resume, keywordData, jobDescription, options));
      }

      if (options.variantType === 'balanced' || options.variantType === 'aggressive') {
        variants.push(await this.generateBalancedVariant(resume, keywordData, jobDescription, options));
      }

      if (options.variantType === 'aggressive') {
        variants.push(await this.generateAggressiveVariant(resume, keywordData, jobDescription, options));
      }

      return variants;
    } catch (error) {
      logger.error('Resume tailoring error:', error);
      throw new Error('Failed to generate tailored resume variants');
    }
  }

  /**
   * Generate conservative variant (minimal changes, focus on keyword matching)
   */
  private static async generateConservativeVariant(
    resume: MasterResume,
    keywordData: any,
    jobDescription: string,
    options: TailoringOptions
  ): Promise<TailoringResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildConservativePrompt(resume, keywordData, jobDescription);
      const result = await LMProviderFactory.generateWithFallback(prompt.userPrompt, {
        temperature: 0.3,
        maxTokens: 1500,
      });

      const tailoredContent = this.parseTailoredContent(result.response.content, resume);

      return {
        success: true,
        tailoredContent,
        variantType: 'conservative',
        confidence: 0.9,
        changes: this.identifyChanges(resume, tailoredContent),
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: result.response.usage?.totalTokens,
          model: result.response.model,
          provider: result.response.provider,
        }
      };
    } catch (error) {
      logger.error('Conservative variant generation error:', error);
      return {
        success: false,
        variantType: 'conservative',
        error: error instanceof Error ? error.message : 'Failed to generate conservative variant',
        metadata: {
          processingTime: Date.now() - startTime,
        }
      };
    }
  }

  /**
   * Generate balanced variant (moderate changes, good balance of keywords and enhancements)
   */
  private static async generateBalancedVariant(
    resume: MasterResume,
    keywordData: any,
    jobDescription: string,
    options: TailoringOptions
  ): Promise<TailoringResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildBalancedPrompt(resume, keywordData, jobDescription);
      const result = await LMProviderFactory.generateWithFallback(prompt.userPrompt, {
        temperature: 0.5,
        maxTokens: 2000,
      });

      const tailoredContent = this.parseTailoredContent(result.response.content, resume);

      return {
        success: true,
        tailoredContent,
        variantType: 'balanced',
        confidence: 0.8,
        changes: this.identifyChanges(resume, tailoredContent),
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: result.response.usage?.totalTokens,
          model: result.response.model,
          provider: result.response.provider,
        }
      };
    } catch (error) {
      logger.error('Balanced variant generation error:', error);
      return {
        success: false,
        variantType: 'balanced',
        error: error instanceof Error ? error.message : 'Failed to generate balanced variant',
        metadata: {
          processingTime: Date.now() - startTime,
        }
      };
    }
  }

  /**
   * Generate aggressive variant (significant changes, maximum optimization)
   */
  private static async generateAggressiveVariant(
    resume: MasterResume,
    keywordData: any,
    jobDescription: string,
    options: TailoringOptions
  ): Promise<TailoringResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildAggressivePrompt(resume, keywordData, jobDescription);
      const result = await LMProviderFactory.generateWithFallback(prompt.userPrompt, {
        temperature: 0.7,
        maxTokens: 2500,
      });

      const tailoredContent = this.parseTailoredContent(result.response.content, resume);

      return {
        success: true,
        tailoredContent,
        variantType: 'aggressive',
        confidence: 0.7,
        changes: this.identifyChanges(resume, tailoredContent),
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: result.response.usage?.totalTokens,
          model: result.response.model,
          provider: result.response.provider,
        }
      };
    } catch (error) {
      logger.error('Aggressive variant generation error:', error);
      return {
        success: false,
        variantType: 'aggressive',
        error: error instanceof Error ? error.message : 'Failed to generate aggressive variant',
        metadata: {
          processingTime: Date.now() - startTime,
        }
      };
    }
  }

  /**
   * Build conservative tailoring prompt
   */
  private static buildConservativePrompt(
    resume: MasterResume,
    keywordData: any,
    jobDescription: string
  ): { systemPrompt: string; userPrompt: string } {
    return {
      systemPrompt: `You are an expert resume writer specializing in ATS optimization. Create a conservative, professional resume that maintains authenticity while improving ATS compatibility.

Focus on:
- Adding relevant keywords naturally
- Minor phrasing improvements
- Maintaining original meaning and achievements
- Professional tone and formatting`,

      userPrompt: `Please optimize this resume for the following job description using a CONSERVATIVE approach:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

KEYWORDS TO INCORPORATE:
${keywordData.allKeywords.join(', ')}

Please provide the optimized resume content in JSON format with these sections:
{
  "personalInfo": { "summary": "optimized professional summary" },
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "2020-01",
      "endDate": "2023-01",
      "description": "optimized description with relevant keywords"
    }
  ],
  "keywords": ["extracted", "keywords"],
  "suggestions": ["specific suggestions for improvements"]
}

Make minimal but strategic changes. Keep the original voice and achievements intact while naturally incorporating 5-7 of the most relevant keywords.`
    };
  }

  /**
   * Build balanced tailoring prompt
   */
  private static buildBalancedPrompt(
    resume: MasterResume,
    keywordData: any,
    jobDescription: string
  ): { systemPrompt: string; userPrompt: string } {
    return {
      systemPrompt: `You are a professional resume writer and career coach. Create a well-optimized resume that balances ATS compatibility with compelling content.

Focus on:
- Strategic keyword integration
- Enhanced descriptions with achievements
- Improved readability and impact
- Professional presentation`,

      userPrompt: `Please optimize this resume for the job description using a BALANCED approach:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

KEYWORDS TO INCORPORATE:
${keywordData.allKeywords.join(', ')}

Provide the optimized resume in JSON format with enhanced content:
{
  "personalInfo": { "summary": "compelling professional summary" },
  "skills": ["strategically", "ordered", "skills"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "2020-01",
      "endDate": "2023-01",
      "description": "enhanced description with quantified achievements"
    }
  ],
  "keywords": ["relevant", "keywords"],
  "suggestions": ["specific improvement suggestions"]
}

Make meaningful improvements while maintaining authenticity. Incorporate 8-12 relevant keywords and enhance descriptions with specific achievements and metrics where possible.`
    };
  }

  /**
   * Build aggressive tailoring prompt
   */
  private static buildAggressivePrompt(
    resume: MasterResume,
    keywordData: any,
    jobDescription: string
  ): { systemPrompt: string; userPrompt: string } {
    return {
      systemPrompt: `You are a senior career strategist and ATS optimization expert. Create a highly optimized resume that maximizes both ATS compatibility and human reader impact.

Focus on:
- Maximum keyword integration
- Quantified achievements and metrics
- Compelling descriptions
- Strategic skill positioning`,

      userPrompt: `Please create an AGGRESSIVELY optimized version of this resume for the job:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

KEYWORDS TO INCORPORATE:
${keywordData.allKeywords.join(', ')}

Return a highly optimized resume in JSON format:
{
  "personalInfo": { "summary": "powerful, keyword-rich summary" },
  "skills": ["prioritized", "skills", "list"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "2020-01",
      "endDate": "2023-01",
      "description": "achievement-focused description with metrics"
    }
  ],
  "keywords": ["all", "relevant", "keywords"],
  "suggestions": ["strategic suggestions"]
}

Maximize ATS optimization while creating compelling content. Incorporate as many relevant keywords as possible and significantly enhance all descriptions with achievements, metrics, and impactful language.`
    };
  }

  /**
   * Parse AI response to extract tailored content
   */
  private static parseTailoredContent(content: string, originalResume: MasterResume): TailoredContent {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const data = JSON.parse(jsonMatch[0]);

      return {
        personalInfo: data.personalInfo,
        skills: data.skills,
        experience: data.experience,
        keywords: data.keywords,
        suggestions: data.suggestions,
      };
    } catch (error) {
      logger.error('Failed to parse tailored content:', error);

      // Return minimal tailored content based on original
      return {
        personalInfo: originalResume.personalInfo,
        skills: originalResume.skills?.map(s => s.name || s) || [],
        experience: originalResume.experience || [],
        keywords: [],
        suggestions: ['AI parsing failed, manual review recommended'],
      };
    }
  }

  /**
   * Identify changes between original and tailored content
   */
  private static identifyChanges(original: MasterResume, tailored: TailoredContent): string[] {
    const changes: string[] = [];

    // Check summary changes
    if (tailored.personalInfo?.summary &&
        tailored.personalInfo.summary !== original.personalInfo?.summary) {
      changes.push('Professional summary updated');
    }

    // Check skills changes
    if (tailored.skills && original.skills) {
      const originalSkills = original.skills.map(s => typeof s === 'string' ? s : s.name);
      const addedSkills = tailored.skills.filter(s => !originalSkills.includes(s));
      const removedSkills = originalSkills.filter(s => !tailored.skills!.includes(s));

      if (addedSkills.length > 0) {
        changes.push(`Added skills: ${addedSkills.slice(0, 3).join(', ')}`);
      }
      if (removedSkills.length > 0) {
        changes.push(`Removed skills: ${removedSkills.slice(0, 3).join(', ')}`);
      }
    }

    // Check experience changes
    if (tailored.experience && original.experience) {
      if (tailored.experience.length !== original.experience.length) {
        changes.push('Experience entries modified');
      } else {
        const hasDescriptionChanges = tailored.experience.some((exp, index) =>
          exp.description !== original.experience![index]?.description
        );
        if (hasDescriptionChanges) {
          changes.push('Experience descriptions enhanced');
        }
      }
    }

    return changes;
  }

  /**
   * Enhance individual experience description
   */
  static async enhanceExperienceDescription(
    description: string,
    keywords: string[],
    jobTitle: string
  ): Promise<{ enhanced: string; improvements: string[] }> {
    try {
      const prompt = `Enhance this job description for a ${jobTitle} position by incorporating relevant keywords naturally.

Original Description:
${description}

Relevant Keywords:
${keywords.join(', ')}

Please provide an enhanced version that:
1. Maintains authenticity and facts
2. Incorporates relevant keywords naturally
3. Adds quantifiable achievements where possible
4. Improves readability and impact

Return the response in this format:
ENHANCED: [enhanced description]
IMPROVEMENTS: [list key improvements made]`;

      const result = await LMProviderFactory.generateWithFallback(prompt, {
        temperature: 0.5,
        maxTokens: 800,
      });

      const content = result.response.content;
      const enhancedMatch = content.match(/ENHANCED:\s*(.+?)(?:\n|$)/s);
      const improvementsMatch = content.match(/IMPROVEMENTS:\s*(.+?)(?:\n|$)/s);

      return {
        enhanced: enhancedMatch ? enhancedMatch[1].trim() : description,
        improvements: improvementsMatch ? improvementsMatch[1].split(',').map(i => i.trim()) : [],
      };
    } catch (error) {
      logger.error('Experience enhancement error:', error);
      return {
        enhanced: description,
        improvements: ['Enhancement failed, original description preserved'],
      };
    }
  }
}