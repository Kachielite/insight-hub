// Test fixtures and mock data for authentication tests
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  newUser: {
    email: 'newuser@example.com',
    password: 'newpassword123',
    name: 'New User',
  },
};

// Mock API responses
export const mockApiResponses = {
  loginSuccess: {
    accessToken: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  },
  registerSuccess: {
    accessToken: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  },
  loginError: {
    message: 'Invalid credentials',
  },
  registerError: {
    message: 'Email already exists',
  },
};

// Test utilities for mocking API calls
export const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
};
