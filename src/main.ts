import {bootstrap} from './app';
import * as express from 'express';

async function startServer() {
  const expressApp = await bootstrap(express());
  return expressApp.listen(process.env.PORT || '3002');
}
startServer();