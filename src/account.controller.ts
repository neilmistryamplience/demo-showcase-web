import { Get, Controller, Param, Query, Res } from '@nestjs/common';

@Controller()
export class AccountController {
  constructor() {}
  
  @Get('/account/login')
  login(@Res() res, @Query('username') username, @Query('redirect') redirect: string = '/'): void {
    res.cookie('segment', username);
    res.redirect(redirect);
  }

  @Get('/account/logout')
  logout(@Res() res, @Query('redirect') redirect: string = '/'): void {
    res.clearCookie('segment');
    res.redirect(redirect);
  }


}
