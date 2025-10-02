// Resume Management Types
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  linkedIn?: string;
  website?: string;
  summary?: string;
}

export interface Skill {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description: string;
  achievements?: string[];
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  description?: string;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  github?: string;
}

export interface Language {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface Interest {
  name: string;
  category?: string;
}

export interface MasterResume {
  id?: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
  interests: Interest[];
  templateId?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeVariant {
  id?: string;
  masterResumeId: string;
  jobDescriptionId: string;
  tailoredContent: {
    personalInfo?: PersonalInfo;
    skills?: Skill[];
    experience?: Experience[];
    summary?: string;
    keywords?: string[];
  };
  variantType: 'conservative' | 'balanced' | 'aggressive';
  atsScore?: number;
  feedback?: string[];
  version: number;
  isGenerated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResumeData {
  title: string;
  personalInfo: PersonalInfo;
  skills?: Skill[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  projects?: Project[];
  languages?: Language[];
  interests?: Interest[];
  templateId?: string;
  isDefault?: boolean;
}

export interface UpdateResumeData extends Partial<CreateResumeData> {
  id: string;
}