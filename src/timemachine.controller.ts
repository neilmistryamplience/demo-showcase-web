import { Get, Controller, Param, Query, Res } from '@nestjs/common';
import { HandlebarsService } from './handlebars.service';

@Controller()
export class TimemachineController {
  constructor() {}

  @Get('/timestamp')
  timestamp(@Res() res, @Query('vse') vse, @Query('timestamp') timestamp, @Query('redirect') redirect: string = '/'): void {
    res.cookie('amplience-host', vse);
    res.cookie('timestamp', timestamp);
    res.redirect(redirect);
  }

  @Get('/current')
  root(@Res() res, @Query('redirect') redirect: string = '/'): void {
    res.clearCookie('amplience-host');
    res.clearCookie('timestamp');
    res.redirect(redirect);
  }
}
