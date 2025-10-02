import { PrismaClient } from '@prisma/client';
import { sampleUsers, sampleJobDescriptions, sampleMasterResumes, sampleResumeTemplates } from './sample-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (be careful in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.communication.deleteMany();
    await prisma.statusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.exportedResume.deleteMany();
    await prisma.aTSScoringResult.deleteMany();
    await prisma.resumeVariant.deleteMany();
    await prisma.jobDescription.deleteMany();
    await prisma.masterResume.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.resumeTemplate.deleteMany();
    await prisma.user.deleteMany();
  }

  // Seed Resume Templates
  console.log('📄 Seeding resume templates...');
  for (const template of sampleResumeTemplates) {
    await prisma.resumeTemplate.create({
      data: template,
    });
  }

  // Seed Users
  console.log('👥 Seeding users...');
  const createdUsers = [];
  for (const userData of sampleUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        userPreferences: {
          create: {
            theme: 'light',
            aiSuggestionsEnabled: true,
            emailNotifications: true,
          },
        },
      },
    });
    createdUsers.push(user);
  }

  // Seed Master Resumes
  console.log('📋 Seeding master resumes...');
  const createdResumes = [];
  for (let i = 0; i < sampleMasterResumes.length; i++) {
    const resumeData = sampleMasterResumes[i];
    const user = createdUsers[i % createdUsers.length];
    
    const resume = await prisma.masterResume.create({
      data: {
        ...resumeData,
        userId: user.id,
      },
    });
    createdResumes.push(resume);
  }

  // Seed Job Descriptions
  console.log('💼 Seeding job descriptions...');
  const createdJobs = [];
  for (let i = 0; i < sampleJobDescriptions.length; i++) {
    const jobData = sampleJobDescriptions[i];
    const user = createdUsers[i % createdUsers.length];
    
    const job = await prisma.jobDescription.create({
      data: {
        ...jobData,
        userId: user.id,
      },
    });
    createdJobs.push(job);
  }

  // Create Resume Variants and Applications
  console.log('🎯 Creating resume variants and applications...');
  for (let i = 0; i < Math.min(createdResumes.length, createdJobs.length); i++) {
    const resume = createdResumes[i];
    const job = createdJobs[i];
    
    // Create resume variants
    const variantTypes = ['conservative', 'balanced', 'aggressive'];
    for (const variantType of variantTypes) {
      const variant = await prisma.resumeVariant.create({
        data: {
          masterResumeId: resume.id,
          jobDescriptionId: job.id,
          variantType,
          tailoredContent: resume.personalInfo, // Simplified for demo
          atsScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        },
      });

      // Create ATS scoring result
      await prisma.aTSScoringResult.create({
        data: {
          resumeVariantId: variant.id,
          keywordScore: Math.random() * 100,
          skillsScore: Math.random() * 100,
          experienceScore: Math.random() * 100,
          formatScore: Math.random() * 100,
          educationScore: Math.random() * 100,
          overallScore: Math.random() * 100,
          recommendations: [
            'Add more relevant keywords from the job description',
            'Highlight specific achievements with quantifiable results',
            'Include more technical skills mentioned in the requirements',
          ],
        },
      });
    }

    // Create application
    const statuses = ['APPLIED', 'VIEWED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'REJECTED'];
    await prisma.application.create({
      data: {
        userId: resume.userId,
        jobDescriptionId: job.id,
        resumeVariantId: (await prisma.resumeVariant.findFirst({
          where: {
            masterResumeId: resume.id,
            jobDescriptionId: job.id,
            variantType: 'balanced',
          },
        }))?.id,
        applicationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
        notes: 'Application submitted through company website',
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created ${createdUsers.length} users`);
  console.log(`Created ${createdResumes.length} master resumes`);
  console.log(`Created ${createdJobs.length} job descriptions`);
  console.log(`Created ${createdResumes.length * 3} resume variants`);
  console.log(`Created ${createdResumes.length} applications`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });