import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { HandlebarsService } from './handlebars.service';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpack from 'webpack';
import * as config from '../webpack.config.js';

const sassMiddleware = require('node-sass-middleware');

const exphbs = require('express-handlebars');

const isDevelopment = process.env.NODE_ENV !== 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const handlebarsService = app.get(HandlebarsService);
  //app.setBaseViewsDir(join(__dirname + './../src/views'));
  app.use(sassMiddleware({
    /* Options */
    src: join(__dirname, 'scss'),
    dest: join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css',  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
  }));

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

  await app.listen(process.env.PORT || '3001');

  app.useStaticAssets(join(__dirname + 'public'));

  /*if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }*/
}

bootstrap();
