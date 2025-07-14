// Set environment variables BEFORE importing any modules
// Import this file in your test setup
import { Constants } from '@configuration/constants';

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_ACCESS_TOKEN_EXPIRY = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d';

// This ensures the Constants are loaded with the test environment variables
export default Constants;
