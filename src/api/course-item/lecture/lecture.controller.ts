import { CreateLectureReq } from '@/api/course-item';
import { LectureService } from '@/api/course-item/lecture/lecture.service';
import { JwtPayloadType } from '@/api/token';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';

@Controller({ path: 'lectures', version: '1' })
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @ApiAuth({
    summary: 'create course item: Lecture',
    statusCode: HttpStatus.CREATED,
  })
  @Post()
  async create(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateLectureReq,
  ) {
    return await this.lectureService.create(user, dto);
  }
}
