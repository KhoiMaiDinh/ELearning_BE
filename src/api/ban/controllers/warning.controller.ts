import { JwtPayloadType } from '@/api/token';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Controller, Get } from '@nestjs/common';
import { WarningService } from '../services/warning.service';

@Controller({ path: 'warnings', version: '1' })
export class UserWarningController {
  constructor(private readonly warningService: WarningService) {}

  @ApiAuth()
  @Get('me')
  async getUserWarnings(@CurrentUser() user: JwtPayloadType) {
    return this.warningService.getActiveWarnings(user.id);
  }
}
