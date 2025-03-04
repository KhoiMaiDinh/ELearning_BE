import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Body, Controller, Get, HttpStatus, Put } from '@nestjs/common';
import { PreferenceRes, UpdatePreferenceReq } from './dto';
import { PreferenceService } from './preference.service';

@Controller('preference')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get('me')
  @ApiAuth({
    type: PreferenceRes,
    statusCode: HttpStatus.OK,
  })
  async findOne(
    @CurrentUser('id') user_public_id: Nanoid,
  ): Promise<PreferenceRes> {
    return await this.preferenceService.findOneOfUser(user_public_id);
  }

  @Put('me')
  @ApiAuth({
    type: PreferenceRes,
    statusCode: HttpStatus.OK,
  })
  async update(
    @CurrentUser('id') user_public_id: Nanoid,
    @Body() updatePreferenceDto: UpdatePreferenceReq,
  ): Promise<PreferenceRes> {
    return await this.preferenceService.update(
      user_public_id,
      updatePreferenceDto,
    );
  }
}
