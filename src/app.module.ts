import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { VisualizationController } from './visualization.controller';
import { DeliveryService } from './delivery.service';
import { HandlebarsService } from './handlebars.service';
import { TimemachineController } from './timemachine.controller';
import { LocaleController } from './locale.controller';
import { AccountController } from './account.controller';

const handlebarsService = new HandlebarsService();
const deliveryProvider = {
  provide: 'DeliveryService',
  useValue: new DeliveryService('https://c1.adis.ws', 'willow'),
};
const handlebarsProvider = {
  provide: 'HandlebarsService',
  useValue: handlebarsService,
};
@Module({
  imports: [],
  controllers: [VisualizationController, AppController, TimemachineController, LocaleController, AccountController],
  providers: [deliveryProvider, handlebarsProvider],
})
export class AppModule {
  handlebars: HandlebarsService = handlebarsService;
}
