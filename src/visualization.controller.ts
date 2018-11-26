import { Get, Controller, Query, Render, Req } from '@nestjs/common';
import { DeliveryService, GraphItem } from './delivery.service';
import { HandlebarsService } from './handlebars.service';

@Controller('/visualization')
export class VisualizationController {
  constructor(private readonly handlebarsService: HandlebarsService) {}

  @Get()
  @Render('visualization')
  async root(@Req() req, @Query('vse') vse, @Query('content') content): Promise<GraphItem> {
    
    const locale = req.query['locale'] || req.cookies['locale'] || 'en-US';
    const segment = req.query['segment'] || req.cookies['segment'];

    const deliveryService: DeliveryService = new DeliveryService(
      vse || 'https://8d0nfe8p86q314k885enoody0.staging.bigcontent.io',
      'willow',
      locale
    );

    this.handlebarsService.setSegment(segment);

    return deliveryService.getById(content);
  }
}
