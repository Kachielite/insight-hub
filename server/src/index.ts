interface Config {
  port: number;
  host: string;
}

const config: Config = {
  port: 3000,
  host: 'localhost',
};

const server = () => {
  console.log(`Server running on ${config.host}:${config.port}`);
};

export default server;
