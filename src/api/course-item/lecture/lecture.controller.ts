import { CreateLectureReq, LectureRes } from '@/api/course-item';
import { LectureService } from '@/api/course-item/lecture/lecture.service';
import { ProgressRes, UpsertWatchTimeReq } from '@/api/course-progress/dto';
import { LessonProgressService } from '@/api/course-progress/lesson-progress.service';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';

@Controller({ path: 'lectures', version: '1' })
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly progressService: LessonProgressService,
  ) {}

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

  @ApiAuth({
    summary: 'View course item: Lecture',
    statusCode: HttpStatus.CREATED,
    type: LectureRes,
  })
  @Get(':id')
  async find(@Param('id') id: Nanoid, @CurrentUser() user: JwtPayloadType) {
    return await this.lectureService.findOne(user, id);
  }

  @ApiAuth({
    summary: 'Upsert progress of course item: Lecture',
    statusCode: HttpStatus.OK,
    type: ProgressRes,
  })
  @Put(':id/progress')
  async upsertProgress(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') lecture_id: Nanoid,
    @Body() dto: UpsertWatchTimeReq,
  ): Promise<ProgressRes> {
    return await this.progressService.upsertWatchTime(
      user,
      lecture_id,
      dto.watch_time,
    );
  }
}
