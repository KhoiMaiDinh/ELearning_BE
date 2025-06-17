import {
  CreateLectureReq,
  LectureRes,
  UpdateLectureReq,
} from '@/api/course-item';
import { LectureService } from '@/api/course-item/lecture/lecture.service';
import { ProgressRes, UpsertWatchTimeReq } from '@/api/course-progress/dto';
import { LessonProgressService } from '@/api/course-progress/lesson-progress.service';
import {
  CreateCommentReq,
  FindLectureCommentsRes,
} from '@/api/lecture-comment/dto';
import { LectureCommentsQuery } from '@/api/lecture-comment/dto/lecture-comments.query.dto';
import { LectureCommentService } from '@/api/lecture-comment/lecture-comment.service';
import { ThreadRes } from '@/api/thread/dto';
import { ThreadService } from '@/api/thread/services/thread.service';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
    summary: 'update course item: Lecture',
    statusCode: HttpStatus.OK,
  })
  @Put(':id')
  async update(
    @Param('id') id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: UpdateLectureReq,
  ) {
    return await this.lectureService.update(user, id, dto);
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
    // type: LectureCommentRes,
  })
  @Get(':id/comments')
  async getComments(
    @Param('id') id: Nanoid,
    @Query() query: LectureCommentsQuery,
  ) {
    const { comments, statistics } = await this.commentService.findInLecture(
      id,
      query,
    );
    plainToInstance(FindLectureCommentsRes, { comments, statistics });

    return plainToInstance(FindLectureCommentsRes, {
      comments,
      statistics,
    });
  }

  @Get(':lecture_id/threads')
  @ApiAuth({
    summary: 'Get threads for a lecture',
  })
  async findThreads(@Param('lecture_id') lecture_id: Nanoid) {
    const threads = this.threadService.getByLecture(lecture_id);
    return plainToInstance(ThreadRes, threads);
  }

  @ApiAuth({
    summary: 'Hide (soft delete) a lecture',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Patch(':id/hide')
  async hideLecture(
    @Param('id') id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.lectureService.hide(user, id);
    return { message: 'Lecture hidden successfully' };
  }

  @ApiAuth({
    summary: 'Unhide a lecture (undo soft delete)',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Patch(':id/unhide')
  async unhideLecture(
    @Param('id') id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.lectureService.unhide(user, id);
    return { message: 'Lecture restored successfully' };
  }

  @ApiAuth({
    summary:
      'Delete lecture if only draft version exists, else remove draft only',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Delete(':id')
  async deleteDraftLecture(
    @Param('id') id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.lectureService.removeDraftVersion(user, id);
  }
}
