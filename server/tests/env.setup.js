// This file runs before all other test setup files
// Set environment variables that are needed for tests
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tests';
process.env.JWT_ACCESS_TOKEN_EXPIRY = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d';
process.env.NODE_ENV = 'test';
