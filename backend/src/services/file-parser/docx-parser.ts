import mammoth from 'mammoth';
import { TextExtractionResult, ParserOptions, ParsedResumeData } from './types';
import { logger } from '../../logger';

export class DOCXParser {
  /**
   * Extract text from DOCX buffer
   */
  static async extractText(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });

      return {
        text: result.value,
        metadata: {
          // DOCX metadata extraction would require additional processing
        }
      };
    } catch (error) {
      logger.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX file');
    }
  }

  /**
   * Parse DOCX and extract resume data
   */
  static async parseResume(buffer: Buffer, options: ParserOptions = {}): Promise<ParsedResumeData> {
    try {
      const extractionResult = await this.extractText(buffer);

      if (!extractionResult.text.trim()) {
        throw new Error('No text content found in DOCX');
      }

      const text = options.cleanText ? this.cleanText(extractionResult.text) : extractionResult.text;

      return this.extractResumeData(text, options);
    } catch (error) {
      logger.error('DOCX resume parsing error:', error);
      throw error;
    }
  }

  /**
   * Clean extracted text from DOCX
   */
  private static cleanText(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Fix broken words at line ends
      .replace(/(\w+)-\s*(\w+)/g, '$1$2')
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Remove common DOCX formatting artifacts
      .replace(/[\u000B\u000C\u0085\u2028\u2029]/g, '\n')
      .trim();
  }

  /**
   * Extract structured data from DOCX resume text
   */
  private static extractResumeData(text: string, options: ParserOptions): ParsedResumeData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: ParsedResumeData = {
      personalInfo: {},
      skills: [],
      experience: [],
      education: [],
      certifications: []
    };

    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Detect sections (similar logic to PDF parser)
      if (this.isSectionHeader(line)) {
        currentSection = this.identifySection(line);
        continue;
      }

      // Extract based on current section
      switch (currentSection) {
        case 'contact':
        case 'personal':
          if (options.extractContactInfo !== false) {
            this.extractContactInfo(line, result);
          }
          break;

        case 'summary':
        case 'objective':
          if (!result.summary && line.length > 20) {
            result.summary = line;
          }
          break;

        case 'skills':
        case 'skill':
          if (options.extractSkills !== false) {
            this.extractSkills(line, result);
          }
          break;

        case 'experience':
        case 'work':
        case 'employment':
          if (options.extractExperience !== false) {
            const experience = this.extractExperience(line, lines, i);
            if (experience) {
              result.experience.push(experience);
              i += 5; // Skip ahead to avoid reprocessing
            }
          }
          break;

        case 'education':
          if (options.extractEducation !== false) {
            const education = this.extractEducation(line, lines, i);
            if (education) {
              result.education.push(education);
              i += 3; // Skip ahead
            }
          }
          break;

        case 'certifications':
        case 'certification':
        case 'certificates':
          if (options.extractCertifications !== false) {
            this.extractCertifications(line, result);
          }
          break;

        case 'projects':
        case 'project':
          if (options.extractProjects !== false) {
            this.extractProjects(line, result);
          }
          break;
      }
    }

    return result;
  }

  /**
   * Check if line is a section header
   */
  private static isSectionHeader(line: string): boolean {
    const sectionKeywords = [
      'contact', 'personal', 'summary', 'objective', 'skills', 'skill',
      'experience', 'work', 'employment', 'education', 'certifications',
      'certification', 'certificates', 'projects', 'project', 'awards',
      'achievements', 'languages', 'interests', 'references'
    ];

    const upperLine = line.toUpperCase();
    return sectionKeywords.some(keyword => upperLine.includes(keyword.toUpperCase())) &&
           line.length < 50 &&
           !line.includes('@') &&
           !line.includes('.com');
  }

  /**
   * Identify section type from header
   */
  private static identifySection(header: string): string {
    const lowerHeader = header.toLowerCase();

    if (lowerHeader.includes('contact') || lowerHeader.includes('personal')) return 'contact';
    if (lowerHeader.includes('summary') || lowerHeader.includes('objective')) return 'summary';
    if (lowerHeader.includes('skill')) return 'skills';
    if (lowerHeader.includes('experience') || lowerHeader.includes('work') || lowerHeader.includes('employment')) return 'experience';
    if (lowerHeader.includes('education')) return 'education';
    if (lowerHeader.includes('certification') || lowerHeader.includes('certificate')) return 'certifications';
    if (lowerHeader.includes('project')) return 'projects';

    return 'other';
  }

  /**
   * Extract contact information
   */
  private static extractContactInfo(line: string, result: ParsedResumeData): void {
    // Email
    const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch && !result.personalInfo.email) {
      result.personalInfo.email = emailMatch[0];
    }

    // Phone
    const phoneMatch = line.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch && !result.personalInfo.phone) {
      result.personalInfo.phone = phoneMatch[0];
    }

    // Name (look for capitalized words at the top)
    if (line === line.toUpperCase() && line.length > 2 && line.length < 30) {
      const nameParts = line.split(' ');
      if (nameParts.length >= 2) {
        result.personalInfo.firstName = nameParts[0];
        result.personalInfo.lastName = nameParts.slice(1).join(' ');
      }
    }

    // LinkedIn
    if (line.toLowerCase().includes('linkedin')) {
      const linkedinMatch = line.match(/linkedin\.com\/in\/[\w\-]+/);
      if (linkedinMatch) {
        result.personalInfo.linkedIn = `https://linkedin.com/in/${linkedinMatch[0].split('/').pop()}`;
      }
    }
  }

  /**
   * Extract skills
   */
  private static extractSkills(line: string, result: ParsedResumeData): void {
    // Split by common separators
    const skills = line.split(/[,•·|]/).map(skill => skill.trim()).filter(skill => skill.length > 0);

    skills.forEach(skill => {
      if (skill.length > 2 && skill.length < 50 && !result.skills.includes(skill)) {
        result.skills.push(skill);
      }
    });
  }

  /**
   * Extract experience information
   */
  private static extractExperience(currentLine: string, allLines: string[], index: number): any {
    // Look for company/position pattern
    const companyMatch = currentLine.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    if (companyMatch) {
      const company = companyMatch[1].trim();
      const position = companyMatch[2].trim();

      // Look for dates in next few lines
      let startDate = '', endDate = '';
      for (let i = index + 1; i < Math.min(index + 4, allLines.length); i++) {
        const dateMatch = allLines[i].match(/(\d{4})[\s-]*(\d{4})?|(\w+\s+\d{4})[\s-]*(\w+\s+\d{4})?/);
        if (dateMatch) {
          startDate = dateMatch[1] || dateMatch[3] || '';
          endDate = dateMatch[2] || dateMatch[4] || '';
          break;
        }
      }

      // Collect description (next few lines until next section)
      let description = '';
      for (let i = index + 1; i < Math.min(index + 6, allLines.length); i++) {
        if (this.isSectionHeader(allLines[i])) break;
        if (allLines[i].length > 10) {
          description += allLines[i] + ' ';
        }
      }

      return {
        company,
        position,
        startDate,
        endDate,
        description: description.trim()
      };
    }

    return null;
  }

  /**
   * Extract education information
   */
  private static extractEducation(currentLine: string, allLines: string[], index: number): any {
    // Look for degree/institution pattern
    if (currentLine.includes('University') || currentLine.includes('College') || currentLine.includes('Bachelor') || currentLine.includes('Master')) {
      const institution = currentLine;

      // Look for degree in next line
      let degree = '';
      if (index + 1 < allLines.length) {
        degree = allLines[index + 1];
      }

      return {
        institution,
        degree,
        startDate: '',
        endDate: ''
      };
    }

    return null;
  }

  /**
   * Extract certifications
   */
  private static extractCertifications(line: string, result: ParsedResumeData): void {
    if (line.length > 5 && line.length < 100) {
      result.certifications.push({
        name: line,
        issuer: '',
        date: ''
      });
    }
  }

  /**
   * Extract projects
   */
  private static extractProjects(line: string, result: ParsedResumeData): void {
    if (!result.projects) result.projects = [];

    if (line.length > 10 && line.length < 200) {
      result.projects.push({
        name: line,
        description: '',
        technologies: []
      });
    }
  }
}