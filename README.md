# 🚀 Smart Resume Builder - AI-Powered ATS Optimization

A comprehensive, AI-driven resume builder and ATS optimization platform that helps job seekers create professional, ATS-friendly resumes with intelligent content optimization and application tracking.

## ✨ Features

### 🎯 Core Features
- **📄 Smart Resume Parsing**: Upload PDF/DOCX files with automatic content extraction
- **🤖 AI-Powered Optimization**: Intelligent resume tailoring using advanced language models
- **📊 ATS Scoring**: Comprehensive ATS compatibility analysis with detailed feedback
- **🔍 Job Description Analysis**: Extract keywords and requirements from job postings
- **📈 Application Tracking**: Complete job application management system
- **📋 Multiple Resume Variants**: Generate conservative, balanced, and aggressive versions
- **🎨 Export Options**: Professional PDF and DOCX export with customizable templates

### 🛠️ Technical Features
- **🔧 Flexible LM Provider System**: Easy switching between OpenRouter, OpenAI, and other providers
- **🗄️ Neon PostgreSQL Database**: Serverless, scalable database with Prisma ORM
- **🔐 JWT Authentication**: Secure user authentication with refresh tokens
- **📡 REST & GraphQL APIs**: Comprehensive API coverage for all features
- **🧩 Modular Architecture**: Easily extensible and maintainable codebase
- **🚀 Vercel Deployment**: Optimized for serverless deployment

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
```
backend/
├── src/
│   ├── services/
│   │   ├── auth/           # Authentication & JWT management
│   │   ├── resume/         # Resume CRUD operations
│   │   ├── file-parser/    # PDF/DOCX parsing
│   │   ├── ats-scoring/    # ATS compatibility analysis
│   │   ├── lm-provider/    # Flexible AI model integration
│   │   └── export/         # PDF/DOCX generation
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── database/           # Prisma client & migrations
│   └── config/             # Environment configuration
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   ├── modules/           # Feature modules
│   ├── services/          # API clients
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database
- OpenRouter API key (or other LM provider)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-resume-builder
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   ```bash
   # Database
   DATABASE_URL="your-neon-database-url"
   DIRECT_URL="your-neon-direct-url"

   # LM Provider (OpenRouter recommended)
   LM_PROVIDER=openrouter
   LM_PRIMARY_MODEL=anthropic/claude-3.5-sonnet
   OPENROUTER_API_KEY="your-openrouter-api-key"

   # Fallback Provider
   LM_FALLBACK_PROVIDER=openai
   LM_FALLBACK_MODEL=gpt-4
   OPENAI_API_KEY="your-openai-api-key"

   # Authentication
   JWT_SECRET="your-jwt-secret-min-32-chars"
   JWT_EXPIRE="7d"

   # Server
   PORT=3001
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Backend**
   ```bash
   npm run dev
   ```

6. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

7. **Configure Frontend Environment**
   ```bash
   VITE_API_URL=http://localhost:3001
   VITE_APP_ENV=development
   ```

8. **Start Frontend**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### LM Provider Setup

The system supports multiple AI providers through a flexible abstraction layer:

#### OpenRouter (Recommended)
```bash
LM_PROVIDER=openrouter
OPENROUTER_API_KEY="sk-or-v1-your-key-here"
LM_PRIMARY_MODEL=anthropic/claude-3.5-sonnet
```

#### OpenAI
```bash
LM_PROVIDER=openai
OPENAI_API_KEY="sk-your-key-here"
LM_PRIMARY_MODEL=gpt-4
```

#### Supported Models (OpenRouter)
- `anthropic/claude-3.5-sonnet` - Best for resume optimization
- `anthropic/claude-3-haiku` - Fast and cost-effective
- `openai/gpt-4` - High quality, widely available
- `google/gemini-pro` - Good alternative option
- `meta-llama/llama-3.1-70b` - Open source option

### Database Configuration

The application uses Neon PostgreSQL with Prisma ORM:

```prisma
// Database schema includes
- Users (authentication)
- Master Resumes (base resume data)
- Job Descriptions (job posting data)
- Resume Variants (tailored versions)
- ATS Scoring Results (compatibility analysis)
- Applications (job application tracking)
- User Preferences (customization settings)
```

## 📖 API Documentation

### Authentication Endpoints
```http
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/refresh      # Token refresh
GET    /api/auth/me          # Get current user
PUT    /api/auth/profile      # Update profile
```

### Resume Management
```http
GET    /api/resumes          # Get user resumes
POST   /api/resumes          # Create resume
GET    /api/resumes/:id      # Get specific resume
PUT    /api/resumes/:id      # Update resume
DELETE /api/resumes/:id      # Delete resume
```

### File Upload & Parsing
```http
POST   /api/upload/resume    # Upload and parse resume file
GET    /api/upload/supported-types  # Get supported file types
```

### ATS Scoring
```http
POST   /api/scoring/analyze  # Score resume against job
GET    /api/scoring/results  # Get scoring history
```

## 🎨 Usage Examples

### Creating a Resume from Uploaded File

```typescript
// Upload and parse a resume file
const formData = new FormData();
formData.append('resume', file);

const response = await fetch('/api/upload/resume', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();

// Create master resume from parsed data
const resume = await fetch('/api/resumes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Software Engineer Resume',
    ...data
  })
});
```

### Generating Tailored Resume Variants

```typescript
// Analyze job description
const jobAnalysis = await fetch('/api/jobs/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    companyName: 'Tech Corp',
    jobTitle: 'Senior Software Engineer',
    jobDescription: jobText
  })
});

// Generate tailored variants
const variants = await fetch('/api/resumes/${resumeId}/tailor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    jobDescriptionId: jobAnalysis.id,
    variantType: 'balanced'
  })
});
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: File type and size validation
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security**: Security headers middleware

## 🚀 Deployment

### Vercel Deployment

1. **Backend Deployment**
   ```bash
   # Add to vercel.json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/backend/dist/server.js" }
     ]
   }
   ```

2. **Environment Variables**
   ```bash
   DATABASE_URL=your-production-db-url
   LM_PROVIDER=openrouter
   OPENROUTER_API_KEY=your-production-key
   JWT_SECRET=your-production-secret
   ```

3. **Database Setup**
   ```bash
   # Use Neon production database
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm run test
npm run test:coverage

# Frontend Tests
cd frontend
npm run test
npm run test:ui
```

## 📊 Monitoring & Analytics

- **Winston Logging**: Comprehensive logging system
- **Error Tracking**: Structured error reporting
- **Performance Monitoring**: API response time tracking
- **Usage Analytics**: Feature usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@smartresumebuilder.com
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🔄 Updates & Changelog

### Version 1.0.0
- ✅ Complete resume builder with AI optimization
- ✅ Flexible LM provider system
- ✅ ATS scoring and analysis
- ✅ Application tracking
- ✅ File upload and parsing
- ✅ Professional export options

### Upcoming Features
- 🔄 Real-time collaboration
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application
- 🔄 Integration with job boards
- 🔄 Advanced template system

---

**Built with ❤️ using modern web technologies and AI**
