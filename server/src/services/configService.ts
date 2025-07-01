export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'insighthub',
  };
};

export const validateConfig = (config: DatabaseConfig): boolean => {
  return (
    config.host.length > 0 && config.port > 0 && config.database.length > 0
  );
};
