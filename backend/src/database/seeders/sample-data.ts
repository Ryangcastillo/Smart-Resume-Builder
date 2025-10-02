export const sampleUsers = [
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  },
  {
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    isActive: true,
  },
  {
    email: 'mike.johnson@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    isActive: true,
  },
  {
    email: 'sarah.wilson@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    isActive: true,
  },
];

export const sampleMasterResumes = [
  {
    title: 'Software Engineer Resume',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: 'https://johndoe.dev',
      summary: 'Experienced software engineer with 5+ years of experience in full-stack development using React, Node.js, and cloud technologies.',
    },
    skills: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 
      'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile Development', 'REST APIs', 'GraphQL'
    ],
    experience: [
      {
        company: 'Tech Innovations Inc.',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2021-03-01',
        endDate: null,
        current: true,
        description: 'Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored junior developers and conducted code reviews.',
        achievements: [
          'Increased application performance by 40% through optimization',
          'Reduced bug reports by 50% through improved testing practices',
          'Led team of 5 developers on critical product features'
        ]
      },
      {
        company: 'StartupCorp',
        position: 'Full-Stack Developer',
        location: 'San Francisco, CA',
        startDate: '2019-06-01',
        endDate: '2021-02-28',
        current: false,
        description: 'Developed and maintained web applications using React and Node.js. Collaborated with design team to implement responsive UI components.',
        achievements: [
          'Built 15+ reusable React components',
          'Implemented authentication system serving 10,000+ users',
          'Reduced page load times by 30%'
        ]
      }
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2015-08-01',
        endDate: '2019-05-01',
        gpa: '3.8',
        relevant_coursework: ['Data Structures', 'Algorithms', 'Database Systems', 'Software Engineering']
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2022-03-15',
        expiryDate: '2025-03-15',
        credential_id: 'AWS-CSA-123456'
      }
    ],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe API', 'AWS'],
        github: 'https://github.com/johndoe/ecommerce-platform',
        demo: 'https://ecommerce-demo.johndoe.dev',
        achievements: ['Handled 1000+ concurrent users', 'Integrated payment processing', 'Implemented admin dashboard']
      }
    ],
    isDefault: true,
  },
  {
    title: 'Marketing Manager Resume',
    personalInfo: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/janesmith',
      summary: 'Results-driven marketing manager with 7+ years of experience in digital marketing, brand management, and campaign optimization.',
    },
    skills: [
      'Digital Marketing', 'SEO/SEM', 'Google Analytics', 'Facebook Ads', 'Content Marketing',
      'Brand Management', 'Campaign Management', 'A/B Testing', 'CRM', 'Marketing Automation'
    ],
    experience: [
      {
        company: 'Global Marketing Agency',
        position: 'Senior Marketing Manager',
        location: 'New York, NY',
        startDate: '2020-01-01',
        endDate: null,
        current: true,
        description: 'Managed digital marketing campaigns for Fortune 500 clients. Increased client ROI by 150% through data-driven strategies.',
        achievements: [
          'Managed $2M+ annual advertising budget',
          'Increased lead generation by 200%',
          'Led team of 8 marketing specialists'
        ]
      }
    ],
    education: [
      {
        institution: 'New York University',
        degree: 'Master of Business Administration',
        field: 'Marketing',
        location: 'New York, NY',
        startDate: '2015-09-01',
        endDate: '2017-05-01',
        gpa: '3.9'
      }
    ],
    certifications: [
      {
        name: 'Google Analytics Certified',
        issuer: 'Google',
        date: '2022-01-15',
        credential_id: 'GA-CERT-789012'
      }
    ],
    isDefault: false,
  }
];

export const sampleJobDescriptions = [
  {
    companyName: 'TechCorp Solutions',
    jobTitle: 'Senior Full-Stack Developer',
    jobDescription: `We are seeking a Senior Full-Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining web applications, working with both frontend and backend technologies.

Key Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Participate in code reviews and architectural decisions
- Mentor junior developers
- Optimize application performance

Requirements:
- 5+ years of experience in full-stack development
- Proficiency in JavaScript, React, Node.js
- Experience with PostgreSQL or similar databases
- Knowledge of cloud platforms (AWS, Azure, or GCP)
- Strong problem-solving skills
- Experience with Agile development methodologies`,
    requirements: [
      '5+ years full-stack development experience',
      'JavaScript and TypeScript proficiency',
      'React and Node.js expertise',
      'Database design and optimization',
      'Cloud platform experience (AWS preferred)',
      'Agile development experience',
      'Strong communication skills'
    ],
    extractedKeywords: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Agile',
      'Full-stack', 'Web applications', 'Code reviews', 'Performance optimization',
      'Mentoring', 'Problem-solving', 'Scalable', 'Cross-functional'
    ],
    skillsRequired: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Git',
      'REST APIs', 'Microservices', 'Docker', 'CI/CD', 'Testing'
    ],
    industry: 'Technology',
    location: 'San Francisco, CA',
    salaryRange: '$140,000 - $180,000',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    companySize: '500-1000',
    benefits: [
      'Health insurance',
      'Dental and vision',
      '401(k) matching',
      'Flexible PTO',
      'Remote work options',
      'Professional development budget'
    ]
  },
  {
    companyName: 'Marketing Innovations Ltd',
    jobTitle: 'Digital Marketing Manager',
    jobDescription: `Join our dynamic marketing team as a Digital Marketing Manager. You'll lead digital campaigns, analyze performance metrics, and drive growth through various online channels.

Key Responsibilities:
- Develop and execute digital marketing strategies
- Manage PPC campaigns across Google Ads and social media
- Analyze campaign performance and optimize for ROI
- Create content marketing strategies
- Collaborate with sales team on lead generation
- Manage marketing automation tools

Requirements:
- 5+ years of digital marketing experience
- Expertise in Google Ads, Facebook Ads, and LinkedIn Ads
- Strong analytical skills with Google Analytics
- Experience with CRM and marketing automation platforms
- Excellent written and verbal communication
- Bachelor's degree in Marketing or related field`,
    requirements: [
      '5+ years digital marketing experience',
      'Google Ads and Facebook Ads expertise',
      'Google Analytics proficiency',
      'CRM and marketing automation experience',
      'Strong analytical and communication skills',
      'Bachelor\'s degree in Marketing'
    ],
    extractedKeywords: [
      'Digital marketing', 'PPC campaigns', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads',
      'Google Analytics', 'ROI optimization', 'Content marketing', 'Lead generation',
      'Marketing automation', 'CRM', 'Campaign management'
    ],
    skillsRequired: [
      'Google Ads', 'Facebook Ads', 'Google Analytics', 'SEO', 'Content Marketing',
      'Email Marketing', 'CRM', 'Marketing Automation', 'A/B Testing', 'Data Analysis'
    ],
    industry: 'Marketing',
    location: 'New York, NY',
    salaryRange: '$90,000 - $120,000',
    employmentType: 'full-time',
    experienceLevel: 'mid-senior',
    companySize: '100-500',
    benefits: [
      'Health insurance',
      'Dental insurance',
      '401(k)',
      'Flexible work hours',
      'Professional development',
      'Performance bonuses'
    ]
  },
  {
    companyName: 'DataTech Analytics',
    jobTitle: 'Data Scientist',
    jobDescription: `We're looking for a Data Scientist to join our analytics team. You'll work with large datasets, build predictive models, and provide actionable insights to drive business decisions.

Key Responsibilities:
- Analyze complex datasets to identify trends and patterns
- Build and deploy machine learning models
- Create data visualizations and reports
- Collaborate with stakeholders to understand business requirements
- Develop predictive analytics solutions
- Ensure data quality and integrity

Requirements:
- PhD or Master's in Data Science, Statistics, or related field
- 3+ years of experience in data science or analytics
- Proficiency in Python and R
- Experience with SQL and database systems
- Knowledge of machine learning frameworks (scikit-learn, TensorFlow, PyTorch)
- Strong statistical analysis skills`,
    requirements: [
      'Advanced degree in Data Science or related field',
      '3+ years data science experience',
      'Python and R proficiency',
      'SQL and database experience',
      'Machine learning frameworks knowledge',
      'Statistical analysis expertise'
    ],
    extractedKeywords: [
      'Data Science', 'Machine Learning', 'Python', 'R', 'SQL', 'TensorFlow', 'PyTorch',
      'Statistical analysis', 'Predictive models', 'Data visualization', 'Big data',
      'scikit-learn', 'Pandas', 'NumPy', 'Analytics'
    ],
    skillsRequired: [
      'Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'scikit-learn',
      'Pandas', 'NumPy', 'Data Visualization', 'Statistics', 'Big Data'
    ],
    industry: 'Technology',
    location: 'Seattle, WA',
    salaryRange: '$130,000 - $170,000',
    employmentType: 'full-time',
    experienceLevel: 'mid-senior',
    companySize: '1000+'
  }
];

export const sampleResumeTemplates = [
  {
    name: 'Modern Professional',
    description: 'Clean, modern template perfect for tech professionals',
    category: 'modern',
    config: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      layout: 'single-column'
    },
    isActive: true,
    isPremium: false
  },
  {
    name: 'Classic Executive',
    description: 'Traditional template suitable for senior positions',
    category: 'classic',
    config: {
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#374151'
      },
      fonts: {
        heading: 'Times New Roman',
        body: 'Times New Roman'
      },
      layout: 'two-column'
    },
    isActive: true,
    isPremium: false
  },
  {
    name: 'Creative Designer',
    description: 'Eye-catching template for creative professionals',
    category: 'creative',
    config: {
      colors: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#c4b5fd'
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Open Sans'
      },
      layout: 'creative-grid'
    },
    isActive: true,
    isPremium: true
  },
  {
    name: 'Technical Minimalist',
    description: 'Minimal template focusing on technical skills',
    category: 'technical',
    config: {
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#10b981'
      },
      fonts: {
        heading: 'Roboto Mono',
        body: 'Roboto'
      },
      layout: 'sidebar-left'
    },
    isActive: true,
    isPremium: false
  }
];