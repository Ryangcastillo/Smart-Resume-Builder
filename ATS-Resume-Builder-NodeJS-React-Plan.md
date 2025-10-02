# ATS Resume Builder - Node.js + React Implementation Plan

## Technology Stack

### Frontend (React.js)
- **React 18** - Core framework (minimal dependencies)
- **React Router** - Client-side routing
- **Axios** - HTTP client for REST API calls
- **Apollo Client** - GraphQL client
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling (utility-first)
- **React-PDF** - PDF generation
- **React-Quill** - Rich text editor

### Backend (Node.js)
- **Express.js** - Web framework
- **Apollo Server** - GraphQL server
- **Prisma** - ORM for PostgreSQL (Neon)
- **@neondatabase/serverless** - Neon database driver
- **Neon Auth** - Authentication service
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Node-cron** - Scheduled tasks
- **Winston** - Logging

### Database & Auth
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Neon Auth** - Built-in authentication system
- **Redis** - Caching layer (optional)

## Modular Architecture

### Frontend Structure
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── resume/          # Resume-specific components
│   ├── job-analysis/    # Job analysis components
│   └── dashboard/       # Dashboard components
├── modules/
│   ├── auth/           # Authentication module
│   ├── resume-builder/ # Resume building logic
│   ├── job-analyzer/   # Job analysis logic
│   ├── ats-scorer/     # ATS scoring logic
│   └── export/         # Export functionality
├── services/
│   ├── api.js          # REST API client
│   ├── graphql.js      # GraphQL client
│   └── storage.js      # Local storage utilities
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── constants/          # Application constants
```

### Backend Structure
```
server/
├── modules/
│   ├── auth/           # Authentication module
│   │   ├── controller.js
│   │   ├── service.js
│   │   ├── routes.js
│   │   └── middleware.js
│   ├── resume/         # Resume management
│   ├── job-analysis/   # Job analysis engine
│   ├── ats-scoring/    # ATS scoring algorithm
│   └── export/         # PDF export service
├── graphql/
│   ├── schemas/        # GraphQL schemas
│   ├── resolvers/      # GraphQL resolvers
│   └── types/          # GraphQL type definitions
├── database/
│   ├── models/         # Sequelize models
│   ├── migrations/     # Database migrations
│   └── seeders/        # Sample data
├── middleware/         # Express middleware
├── utils/              # Utility functions
├── config/             # Configuration files
└── services/           # External service integrations
```

## Database Schema (Neon PostgreSQL)

### Prisma Schema
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Neon connection string
}

// Users table (managed by Neon Auth)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  masterResumes    MasterResume[]
  jobDescriptions  JobDescription[]
  applications     Application[]
  
  @@map("users")
}

// Master Resumes
model MasterResume {
  id             String    @id @default(cuid())
  userId         String    @map("user_id")
  title          String
  personalInfo   Json      @map("personal_info")
  skills         Json      @default("[]")
  experience     Json      @default("[]")
  education      Json      @default("[]")
  certifications Json      @default("[]")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  
  // Relations
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  variants      ResumeVariant[]
  
  @@map("master_resumes")
}

// Job Descriptions
model JobDescription {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  companyName       String    @map("company_name")
  jobTitle          String    @map("job_title")
  jobDescription    String    @map("job_description")
  requirements      Json      @default("[]")
  extractedKeywords Json      @default("[]") @map("extracted_keywords")
  industry          String?
  location          String?
  salaryRange       String?   @map("salary_range")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  // Relations
  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  variants     ResumeVariant[]
  applications Application[]
  
  @@map("job_descriptions")
}

// Resume Variants
model ResumeVariant {
  id                 String    @id @default(cuid())
  masterResumeId     String    @map("master_resume_id")
  jobDescriptionId   String    @map("job_description_id")
  tailoredContent    Json      @map("tailored_content")
  atsScore           Int?      @map("ats_score")
  variantType        String    @map("variant_type") // 'conservative', 'aggressive', 'balanced'
  createdAt          DateTime  @default(now()) @map("created_at")
  
  // Relations
  masterResume     MasterResume        @relation(fields: [masterResumeId], references: [id], onDelete: Cascade)
  jobDescription   JobDescription      @relation(fields: [jobDescriptionId], references: [id], onDelete: Cascade)
  scoringResults   ATSScoringResult[]
  applications     Application[]
  
  @@map("resume_variants")
}

// ATS Scoring Results
model ATSScoringResult {
  id               String    @id @default(cuid())
  resumeVariantId  String    @map("resume_variant_id")
  keywordScore     Float     @map("keyword_score")
  skillsScore      Float     @map("skills_score")
  experienceScore  Float     @map("experience_score")
  formatScore      Float     @map("format_score")
  overallScore     Float     @map("overall_score")
  recommendations  Json      @default("[]")
  createdAt        DateTime  @default(now()) @map("created_at")
  
  // Relations
  resumeVariant    ResumeVariant @relation(fields: [resumeVariantId], references: [id], onDelete: Cascade)
  
  @@map("ats_scoring_results")
}

// Application Tracking
model Application {
  id                 String    @id @default(cuid())
  userId             String    @map("user_id")
  jobDescriptionId   String    @map("job_description_id")
  resumeVariantId    String?   @map("resume_variant_id")
  applicationDate    DateTime  @map("application_date")
  status             String    @default("applied") // 'applied', 'interview', 'rejected', 'offer'
  notes              String?
  followUpDate       DateTime? @map("follow_up_date")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  
  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobDescription  JobDescription   @relation(fields: [jobDescriptionId], references: [id], onDelete: Cascade)
  resumeVariant   ResumeVariant?   @relation(fields: [resumeVariantId], references: [id], onDelete: SetNull)
  
  @@map("applications")
}
```

## API Architecture

### REST API Endpoints

#### Authentication Module (Neon Auth Integration)
```
POST   /api/auth/signup       # User registration via Neon Auth
POST   /api/auth/signin       # User login via Neon Auth
POST   /api/auth/signout      # User logout
GET    /api/auth/user         # Get current user profile
PUT    /api/auth/user         # Update user profile
POST   /api/auth/reset        # Password reset request
```

#### Resume Management
```
GET    /api/resumes           # Get user's resumes
POST   /api/resumes           # Create new resume
GET    /api/resumes/:id       # Get specific resume
PUT    /api/resumes/:id       # Update resume
DELETE /api/resumes/:id       # Delete resume
POST   /api/resumes/upload    # Upload resume file
```

#### Job Analysis
```
POST   /api/jobs              # Create job description
GET    /api/jobs              # Get user's job descriptions
GET    /api/jobs/:id          # Get specific job
PUT    /api/jobs/:id          # Update job description
DELETE /api/jobs/:id          # Delete job description
POST   /api/jobs/analyze      # Analyze job description
```

#### Resume Tailoring
```
POST   /api/tailor            # Generate tailored resume
GET    /api/variants/:resumeId # Get resume variants
PUT    /api/variants/:id      # Update variant
DELETE /api/variants/:id      # Delete variant
```

#### ATS Scoring
```
POST   /api/scoring/analyze   # Score resume against job
GET    /api/scoring/:variantId # Get scoring results
POST   /api/scoring/batch     # Batch score multiple variants
```

#### Export Services
```
POST   /api/export/pdf        # Generate PDF resume
POST   /api/export/docx       # Generate DOCX resume
GET    /api/export/:id        # Download exported file
```

### GraphQL Schema

```graphql
# User type
type User {
  id: ID!
  email: String!
  firstName: String
  lastName: String
  resumes: [MasterResume!]!
  applications: [Application!]!
}

# Master Resume type
type MasterResume {
  id: ID!
  title: String!
  personalInfo: PersonalInfo!
  skills: [Skill!]!
  experience: [Experience!]!
  education: [Education!]!
  variants: [ResumeVariant!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Job Description type
type JobDescription {
  id: ID!
  companyName: String!
  jobTitle: String!
  description: String!
  requirements: [String!]!
  extractedKeywords: [String!]!
  industry: String
  applications: [Application!]!
}

# Resume Variant type
type ResumeVariant {
  id: ID!
  masterResume: MasterResume!
  jobDescription: JobDescription!
  tailoredContent: JSON!
  variantType: VariantType!
  atsScore: Int
  scoringResults: ATSScoringResult
}

# ATS Scoring Result type
type ATSScoringResult {
  id: ID!
  keywordScore: Float!
  skillsScore: Float!
  experienceScore: Float!
  formatScore: Float!
  overallScore: Float!
  recommendations: [String!]!
}

# Queries
type Query {
  me: User
  resume(id: ID!): MasterResume
  resumes: [MasterResume!]!
  jobDescription(id: ID!): JobDescription
  jobDescriptions: [JobDescription!]!
  resumeVariant(id: ID!): ResumeVariant
  applications(status: ApplicationStatus): [Application!]!
}

# Mutations
type Mutations {
  createResume(input: CreateResumeInput!): MasterResume!
  updateResume(id: ID!, input: UpdateResumeInput!): MasterResume!
  deleteResume(id: ID!): Boolean!
  
  createJobDescription(input: CreateJobInput!): JobDescription!
  analyzeJobDescription(id: ID!): JobDescription!
  
  generateResumeVariant(resumeId: ID!, jobId: ID!, type: VariantType!): ResumeVariant!
  scoreResumeVariant(variantId: ID!): ATSScoringResult!
  
  createApplication(input: CreateApplicationInput!): Application!
  updateApplicationStatus(id: ID!, status: ApplicationStatus!): Application!
}

# Subscriptions (real-time updates)
type Subscription {
  scoringProgress(variantId: ID!): ScoringProgress!
  applicationUpdated(userId: ID!): Application!
}
```

## MVP Phase 1: Core Features (4-6 weeks)

### Week 1-2: Foundation Setup
- **Database Setup**: Neon PostgreSQL database configuration and Prisma setup
- **Backend API**: Basic Express.js server with Neon Auth integration
- **Frontend Setup**: React app with routing and basic components
- **Authentication**: Neon Auth system integration

### Week 3-4: Core Resume Features
- **Resume Builder**: CRUD operations for master resumes
- **Job Analysis**: Text parsing and keyword extraction
- **Basic ATS Scoring**: Simple keyword matching algorithm
- **File Upload**: PDF/DOCX resume import functionality

### Week 5-6: Tailoring Engine
- **Resume Variants**: Generate tailored versions
- **Side-by-side Comparison**: React components for comparison view
- **Export to PDF**: Basic PDF generation
- **Basic Dashboard**: Statistics and recent activity

### Core Modules Implementation

#### ATS Scoring Algorithm (Node.js + Prisma)
```javascript
// modules/ats-scoring/service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ATSScoringService {
  async calculateScore(resumeVariantId, jobDescriptionId) {
    const resumeVariant = await prisma.resumeVariant.findUnique({
      where: { id: resumeVariantId },
      include: { masterResume: true, jobDescription: true }
    });
    
    const keywordScore = this.calculateKeywordMatch(
      resumeVariant.tailoredContent, 
      resumeVariant.jobDescription
    );
    const skillsScore = this.calculateSkillsAlignment(
      resumeVariant.masterResume, 
      resumeVariant.jobDescription
    );
    const experienceScore = this.calculateExperienceMatch(
      resumeVariant.masterResume, 
      resumeVariant.jobDescription
    );
    const formatScore = this.calculateFormatQuality(resumeVariant.tailoredContent);
    
    const scoringResult = {
      keywordScore: keywordScore * 0.30,
      skillsScore: skillsScore * 0.25,
      experienceScore: experienceScore * 0.25,
      formatScore: formatScore * 0.20,
      overallScore: (keywordScore * 0.30) + (skillsScore * 0.25) + 
                   (experienceScore * 0.25) + (formatScore * 0.20)
    };
    
    // Save to database
    await prisma.aTSScoringResult.create({
      data: {
        resumeVariantId,
        ...scoringResult,
        recommendations: this.generateRecommendations(scoringResult, resumeVariant.jobDescription)
      }
    });
    
    return scoringResult;
  }
  
  calculateKeywordMatch(resumeContent, jobDescription) {
    const resumeText = JSON.stringify(resumeContent).toLowerCase();
    const keywords = jobDescription.extractedKeywords || [];
    const matches = keywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );
    return keywords.length > 0 ? (matches.length / keywords.length) * 100 : 0;
  }
  
  generateRecommendations(scoringResult, jobDescription) {
    const recommendations = [];
    
    if (scoringResult.keywordScore < 70) {
      recommendations.push({
        type: 'keyword',
        message: 'Add more relevant keywords from the job description',
        keywords: this.getMissingKeywords(scoringResult, jobDescription)
      });
    }
    
    if (scoringResult.skillsScore < 70) {
      recommendations.push({
        type: 'skills',
        message: 'Highlight skills that match the job requirements',
        suggestedSkills: jobDescription.requirements
      });
    }
    
    return recommendations;
  }
}
```

#### Resume Tailoring Engine (Node.js + Prisma)
```javascript
// modules/resume-builder/tailoring-service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ResumeTailoringService {
  async generateVariants(masterResumeId, jobDescriptionId) {
    const masterResume = await prisma.masterResume.findUnique({
      where: { id: masterResumeId }
    });
    
    const jobDescription = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId }
    });
    
    const variants = [
      await this.generateConservativeVariant(masterResume, jobDescription),
      await this.generateBalancedVariant(masterResume, jobDescription),
      await this.generateAggressiveVariant(masterResume, jobDescription)
    ];
    
    // Save variants to database
    const savedVariants = await Promise.all(
      variants.map((variant, index) => 
        prisma.resumeVariant.create({
          data: {
            masterResumeId,
            jobDescriptionId,
            tailoredContent: variant.content,
            variantType: variant.type,
            atsScore: 0 // Will be calculated later
          }
        })
      )
    );
    
    return savedVariants;
  }
  
  async generateBalancedVariant(masterResume, jobDescription) {
    const tailoredContent = {
      personalInfo: masterResume.personalInfo,
      skills: this.prioritizeSkills(masterResume.skills, jobDescription.requirements),
      experience: this.enhanceExperience(masterResume.experience, jobDescription.extractedKeywords),
      education: masterResume.education,
      certifications: masterResume.certifications
    };
    
    return {
      type: 'balanced',
      content: tailoredContent
    };
  }
  
  prioritizeSkills(skills, requirements) {
    // Sort skills based on relevance to job requirements
    const relevantSkills = skills.filter(skill => 
      requirements.some(req => 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const otherSkills = skills.filter(skill => !relevantSkills.includes(skill));
    
    return [...relevantSkills, ...otherSkills];
  }
  
  enhanceExperience(experiences, keywords) {
    return experiences.map(exp => ({
      ...exp,
      description: this.optimizeDescription(exp.description, keywords)
    }));
  }
  
  optimizeDescription(description, keywords) {
    // Add relevant keywords naturally to experience descriptions
    let optimizedDescription = description;
    
    keywords.forEach(keyword => {
      if (!description.toLowerCase().includes(keyword.toLowerCase())) {
        // Logic to naturally incorporate keywords
        optimizedDescription = this.incorporateKeyword(optimizedDescription, keyword);
      }
    });
    
    return optimizedDescription;
  }
}
```

## Phase 2: Enhanced Features (6-8 weeks)

### Advanced Capabilities
- **Multi-variant Generation**: Three tailoring strategies per job
- **Application Tracker**: Kanban board with status pipeline
- **Advanced ATS Scoring**: Format validation and industry-specific rules
- **Real-time Collaboration**: WebSocket-based live editing
- **Analytics Dashboard**: Success metrics and trends

### Performance Optimizations
- **Redis Caching**: Cache frequently accessed data
- **Database Indexing**: Optimize SQL queries
- **CDN Integration**: Static asset delivery
- **Lazy Loading**: Frontend performance optimization

## Deployment Architecture

### Infrastructure
- **Vercel/Netlify**: Host React frontend (static deployment)
- **Railway/Render**: Host Node.js backend
- **Neon PostgreSQL**: Serverless database with built-in auth
- **Upstash Redis**: Serverless caching layer
- **Cloudinary/AWS S3**: File storage for resumes/exports
- **LogTail/DataDog**: Monitoring and analytics

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Docker**: Containerization for consistent deployments
- **Environment Variables**: Secure configuration management via platform

## Security Implementation

### Backend Security (Neon Auth Integration)
```javascript
// middleware/auth.js
const { neon } = require('@neondatabase/serverless');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token with Neon Auth
    const user = await verifyNeonAuthToken(token);
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

// Neon Auth helper
const verifyNeonAuthToken = async (token) => {
  // Implementation depends on Neon Auth SDK
  // This would verify the token and return user data
  const sql = neon(process.env.DATABASE_URL);
  // Query user based on token validation
  return user;
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Data Validation
```javascript
// utils/validation.js
const { z } = require('zod');

const resumeSchema = z.object({
  title: z.string().min(1).max(255),
  personalInfo: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/).optional()
  }),
  skills: z.array(z.string().max(100)),
  experience: z.array(z.object({
    company: z.string().min(1).max(255),
    position: z.string().min(1).max(255),
    startDate: z.date(),
    endDate: z.date().nullable(),
    description: z.string().max(2000)
  }))
});

// Prisma client setup
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Neon connection string
    }
  }
});
```

## Success Metrics & Monitoring

### Performance Targets
- **API Response Time**: <200ms for 95% of requests
- **Database Query Time**: <50ms average
- **Frontend Load Time**: <2 seconds
- **Uptime**: 99.9% availability

### Business Metrics
- **ATS Score Accuracy**: 85%+ correlation with real ATS systems
- **User Engagement**: 70%+ completion rate for resume tailoring
- **Application Success**: 25%+ increase in interview callbacks
- **User Retention**: 60%+ monthly active users
