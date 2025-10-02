import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Mock Prisma client
jest.mock('../database/client', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    masterResume: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    jobDescription: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services
  console.log('🧪 Setting up test environment...');
});

afterAll(async () => {
  // Cleanup
  console.log('🧹 Cleaning up test environment...');
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});