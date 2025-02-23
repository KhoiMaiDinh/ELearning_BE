import { Permission } from '@/constants/permission.constant';
import { ApiAuth } from '@/decorators/index';
import { Permissions } from '@/decorators/permission.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HomeController {
  @Get()
  // @Public()
  @ApiAuth({ summary: 'Home' })
  @Permissions(Permission.HOME)
  home() {
    return 'Welcome to the API';
  }
}
