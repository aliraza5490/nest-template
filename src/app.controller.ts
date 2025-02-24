import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { JWTUser } from './auth/decorators/jwtUser.decorator';
import { Public } from './auth/decorators/public.decorator';
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from './common/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/protected')
  getProtectedHello(@JWTUser() JWTPayload: JWTPayload): string {
    return this.appService.getHello(JWTPayload);
  }

  @Get('/admin-protected')
  @Roles(UserRole.ADMIN)
  getAdminProtectedHello(@JWTUser() JWTPayload: JWTPayload): string {
    return this.appService.getHello(JWTPayload);
  }
}
