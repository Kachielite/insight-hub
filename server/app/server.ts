import { injectable, inject } from 'tsyringe';
import App from './app';
import { Constants } from '../configuration/constants';

@injectable()
class Server {
  constructor(@inject(App) private readonly app: App) {}

  public start(): void {
    this.app.start(Constants.PORT as number);
  }
}

export default Server;
