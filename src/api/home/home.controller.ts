import { ApiPublic, Public } from '@/decorators';
import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HomeController {
  @Get()
  @Public()
  @ApiPublic({ summary: 'Home' })
  home() {
    return 'Welcome to the API';
  }
}
