import 'reflect-metadata';
import App from '@app/app';
import { Constants } from '@config/constants';
import { container, inject, injectable } from 'tsyringe';

import { configureContainer } from './container';

@injectable()
class Server {
  constructor(@inject(App) private readonly app: App) {}

  public start(): void {
    this.app.start(Constants.PORT as number);
  }
}

// Configure all dependency injections
configureContainer();

// Start the server
const server = container.resolve(Server);
server.start();

export default Server;
