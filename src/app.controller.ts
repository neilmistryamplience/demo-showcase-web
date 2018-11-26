import { Get, Controller, Param, Res, Query, Render, Req } from '@nestjs/common';
import { HandlebarsService } from './handlebars.service';
import { DeliveryService, GraphItem } from './delivery.service';

interface Page {
  timestamp: number;
  megaMenu: GraphItem;
  slots: Array<GraphItem>;
}

@Controller('/')
export class AppController {
  constructor(private readonly handlebarsService: HandlebarsService) {
  }

  @Get('/')
  @Render('page')
  async root(@Req() req,
             @Query('segment') segment: string): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      '2eb20504-341e-4c5f-9f0f-13b0d59a5c1e',
      //'d55b27e8-23b3-4a70-b78f-a5d6112452b5',
      '786fdfe5-738b-436c-9af0-76a7f7696e98',
      'c3568665-0fb5-4da5-891f-adc2e8af2779',
    ], req);
  }

  @Get('/womens')
  @Render('page')
  async womens(@Req() req,
               @Query('segment') segment: string): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      '6e030093-714c-406d-85f1-b942cc93f3b4',
      'a8d7445c-f94a-43a6-a914-ff462922d192',
      '0f55d6f0-de04-4488-8385-91c52eb416b0',
      '39d245d8-46ff-4321-9528-82f45b6cfb01',
    ], req);
  }

  @Get('/lookbook')
  @Render('page')
  async lookbook(@Req() req,
                 @Query('segment') segment: string): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      '45c3462b-1612-4a32-859a-bb844d36c276',
    ], req);
  }

  @Get('/inspiration')
  @Render('page')
  async inspiration(@Req() req,
                    @Query('segment') segment: string): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      '3bbe2f81-0429-409c-89d6-81c9fb3c093e',
    ], req);
  }

  @Get('/blog/denim')
  @Render('page')
  async blogDenim(@Req() req,
                  @Query('segment') segment: string): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      'c5ac638d-52fc-4fcb-add4-839181d4519c',
    ], req);
  }

  @Get('/blog/ethical-beauty')
  @Render('page')
  async blogEthicalBeauty(@Req() req,
                          @Query('segment') segment: string): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      'f5889e7d-8c8c-4fb4-93a7-2cd826e70a17',
    ], req);
  }

  @Get('/blog/:id/:seoText')
  @Render('page')
  async blog(@Req() req,
                  @Query('segment') segment: string,
                  @Param('id') id): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      id,
    ], req);
  }
  
  @Get('/:category/:sku/:productName')
  @Render('productPage')
  async productDetailsPage(@Req() req, @Param('sku') sku, @Query('segment') segment): Promise<Page> {
    return this.renderPage([
      '83599656-ba74-4c1e-8b4c-d647c4daa270', //mega menu
      '057caea3-b3a1-4158-938e-7447eaf11153', //pdp slot
      '4d382704-3a31-4792-8ebd-dae6ff400e0a',
    ], req);
  }

  private async renderPage(slotIds: Array<string>,
                           req): Promise<Page> {
    const timestamp = +req.cookies['timestamp'];
    const locale = req.query['locale'] || req.cookies['locale'] || 'en-US';
    const segment = req.query['segment'] || req.cookies['segment'];

    const deliveryService: DeliveryService = new DeliveryService(
      req.cookies['amplience-host'] || 'https://c1.adis.ws',
      'willow',
      locale,
    );
    const slots = await deliveryService.getByIds(slotIds);
    const megaMenu = slots.shift();
    this.handlebarsService.setSegment(segment);
    return {
      slots,
      megaMenu,
      timestamp,
    };
  }
}
