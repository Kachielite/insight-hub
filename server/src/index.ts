import { getDatabaseConfig, validateConfig } from '@/services/configService';

interface ServerConfig {
  port: number;
  host: string;
}

const serverConfig: ServerConfig = {
  port: 3000,
  host: 'localhost',
};

const server = () => {
  const dbConfig = getDatabaseConfig();
  const isValidConfig = validateConfig(dbConfig);

  console.log(`Server running on ${serverConfig.host}:${serverConfig.port}`);
  console.log(`Database config valid: ${isValidConfig}`);
  console.log(
    `Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`
  );
};

export default server;
