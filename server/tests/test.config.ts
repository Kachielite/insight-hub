process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_ACCESS_TOKEN_EXPIRY = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d';

// Import this file in your test setup
import { Constants } from '@configuration/constants';

// This ensures the Constants are loaded with the test environment variables
export default Constants;
