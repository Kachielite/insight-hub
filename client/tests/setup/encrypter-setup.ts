// Test setup file to ensure environment variables are properly mocked
// This must be imported before the Encrypter class

// Set up environment variables for testing
process.env.VITE_TOKEN_SECRET = 'test-secret-key';
process.env.VITE_BACKEND_URL = 'http://localhost:3000';

// Mock the module at the global level
jest.mock('../../../src/core/constants/env', () => ({
  __esModule: true,
  TOKEN_SECRET: 'test-secret-key',
  BACKEND_URL: 'http://localhost:3000',
}));
