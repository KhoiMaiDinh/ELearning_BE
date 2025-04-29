import { CreateLectureReq, LectureRes } from '@/api/course-item';
import { LectureService } from '@/api/course-item/lecture/lecture.service';
import { ProgressRes, UpsertWatchTimeReq } from '@/api/course-progress/dto';
import { LessonProgressService } from '@/api/course-progress/lesson-progress.service';
import { CreateCommentReq, LectureCommentRes } from '@/api/lecture-comment/dto';
import { LectureCommentsQuery } from '@/api/lecture-comment/dto/lecture-comment.query.dto';
import { LectureCommentService } from '@/api/lecture-comment/lecture-comment.service';
import { ThreadRes } from '@/api/thread/dto';
import { ThreadService } from '@/api/thread/services/thread.service';
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
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller({ path: 'lectures', version: '1' })
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly progressService: LessonProgressService,
    private readonly commentService: LectureCommentService,
    private readonly threadService: ThreadService,
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

  @ApiAuth({
    summary: 'Comment a course item: Lecture',
    statusCode: HttpStatus.CREATED,
    type: LectureRes,
  })
  @Post(':id/comments')
  async comment(
    @Param('id') id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateCommentReq,
  ) {
    return await this.commentService.create(user, { ...dto, lecture_id: id });
  }

  @ApiAuth({
    summary: 'Get comments of course item: Lecture',
    statusCode: HttpStatus.OK,
    type: LectureCommentRes,
  })
  @Get(':id/comments')
  async getComments(
    @Param('id') id: Nanoid,
    @Query() query: LectureCommentsQuery,
  ) {
    return await this.commentService.findWithAspectStats(id, query);
  }

  @Get(':lecture_id/threads')
  @ApiAuth({
    summary: 'Get threads for a lecture',
  })
  async findThreads(@Param('lecture_id') lecture_id: Nanoid) {
    const threads = this.threadService.getByLecture(lecture_id);
    return plainToInstance(ThreadRes, threads);
  }
}
