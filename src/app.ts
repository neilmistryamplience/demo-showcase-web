import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { HandlebarsService } from './handlebars.service';
import * as cookieParser from 'cookie-parser';

const sassMiddleware = require('node-sass-middleware');

const exphbs = require('express-handlebars');

export const bootstrap = async (expressServer) => {
  const app = await NestFactory.create(AppModule, expressServer);
  const handlebarsService = app.get(HandlebarsService);

  app.use(cookieParser());
  /*app.use(sassMiddleware({
    src: join(__dirname, 'scss'),
    dest: join(__dirname, 'public/css'),
    outputStyle: 'compressed',
    prefix: '/css',
  }));*/
  app.useStaticAssets(join(__dirname + '/public'));

  app.setBaseViewsDir(join(__dirname + '/views'));
  const expressHandlebars = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    handlebars: handlebarsService.handlebars,
    layoutsDir: 'src/views/layouts',
    partialsDir: 'src/views/partials',
  });
  app.engine('hbs', expressHandlebars.engine);
  const partials = await expressHandlebars.getPartials();
  handlebarsService.registerPartials(partials);
  app.set('view engine', 'hbs');
  return app;
};
