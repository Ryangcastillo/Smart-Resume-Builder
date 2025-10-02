import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API responses
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
      token: 'mock-jwt-token',
    });
  }),

  // Resume endpoints
  http.get('/api/resumes', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Software Engineer Resume',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        createdAt: '2023-01-01T00:00:00Z',
      },
    ]);
  }),

  // Job endpoints
  http.get('/api/jobs', () => {
    return HttpResponse.json([
      {
        id: '1',
        companyName: 'TechCorp',
        jobTitle: 'Senior Developer',
        location: 'San Francisco, CA',
        createdAt: '2023-01-01T00:00:00Z',
      },
    ]);
  }),
];

export const server = setupServer(...handlers);