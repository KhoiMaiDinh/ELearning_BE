import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Body, Controller, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { JwtPayloadType } from '../token';
import { CreateSectionReq, SectionRes, UpdateSectionReq } from './dto';
import { SectionService } from './section.service';

@Controller({ path: 'sections', version: '1' })
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @ApiAuth({
    statusCode: HttpStatus.CREATED,
    summary: 'Create a new section',
    type: SectionRes,
  })
  async createSection(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateSectionReq,
  ) {
    return await this.sectionService.create(user, dto);
  }

  @Put(':id')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Create a new section',
    type: SectionRes,
  })
  async update(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') section_id: Nanoid,
    @Body() dto: UpdateSectionReq,
  ) {
    return await this.sectionService.update(user, section_id, dto);
  }
}
