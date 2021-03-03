import * as bodyParser from 'body-parser';
import * as express from 'express';
import { healthcheckRoute, postProcessDataRoute } from './routes';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));

    this.app.get('/healthcheck', healthcheckRoute);
    this.app.post('/processData', postProcessDataRoute);
  }
}

export default new App().app;
