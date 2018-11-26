import { install } from 'source-map-support';
import {createServer, proxy} from 'aws-serverless-express';
import { bootstrap } from './app';
import * as express from 'express';
import { Express } from 'express';
import { Server } from 'http';
import { eventContext } from 'aws-serverless-express/middleware';
import { Context, Handler } from 'aws-lambda';

install();

let cachedServer: Server;
const expressApp: Express = express();

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below
const binaryMimeTypes: string[] = [];

async function bootstrapServer(): Promise<Server> {
  const nestApp = await bootstrap(expressApp);
  nestApp.use(eventContext());
  await nestApp.init();
  return createServer(expressApp, undefined, binaryMimeTypes);
}

export const handler: Handler = async (event: any, context: Context) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  //Gross, thanks AWS
  // @ts-ignore
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};