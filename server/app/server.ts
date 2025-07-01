import { injectable, inject } from 'tsyringe';
import App from '@app/app';
import { Constants } from '@config/constants';

@injectable()
class Server {
  constructor(@inject(App) private readonly app: App) {}

  public start(): void {
    this.app.start(Constants.PORT as number);
  }
}

export default Server;
