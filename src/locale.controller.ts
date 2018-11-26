import { Get, Controller, Param, Query, Res } from '@nestjs/common';

@Controller()
export class LocaleController {
  constructor() {}
  
  @Get('/locale/:locale')
  locale(@Res() res, @Param('locale') locale, @Query('redirect') redirect: string = '/'): void {
    res.cookie('locale', locale);
    res.redirect(redirect);
  }

}
