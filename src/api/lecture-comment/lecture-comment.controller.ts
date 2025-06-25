import { CursorPaginatedDto, Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtPayloadType } from '../token';
import {
  LectureCommentRes,
  PaginateLectureCommentsQuery,
  TrendOverTimeQuery,
} from './dto';
import { PeriodReq } from './dto/period.query.dto';
import { LectureCommentAnalyzer } from './services/lecture-comment.analyzer';
import { LectureCommentService } from './services/lecture-comment.service';

@Controller({ version: '1' })
export class LectureCommentController {
  constructor(
    private readonly lectureCommentService: LectureCommentService,
    private readonly lectureCommentAnalyzer: LectureCommentAnalyzer,
  ) {}

  @Get('instructors/lecture-comments')
  @ApiAuth({
    summary: "Instructor's lecture comments",
    statusCode: HttpStatus.OK,
    type: LectureCommentRes,
    isPaginated: true,
    paginationType: 'cursor',
  })
  async findAll(
    @CurrentUser() user: JwtPayloadType,
    @Query() filter: PaginateLectureCommentsQuery,
  ) {
    const { comments, metaDto } =
      await this.lectureCommentService.findAllForInstructor(user, filter);

    return new CursorPaginatedDto(
      plainToInstance(LectureCommentRes, comments),
      metaDto,
    );
  }

  @Get('lecture-comments/:id')
  @ApiAuth({
    summary: 'Get a single lecture comment',
    statusCode: HttpStatus.OK,
    type: LectureCommentRes,
  })
  async findOne(@Param('id') id: Nanoid) {
    const comment = await this.lectureCommentService.findOne(id);
    return plainToInstance(LectureCommentRes, comment);
  }

  @Get('instructors/lecture-comments/analytics')
  @ApiAuth({
    summary: 'Get instructor analytics',
    statusCode: HttpStatus.OK,
    type: Object,
  })
  async getFeedbackStats(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: PeriodReq,
  ) {
    const stats = await this.lectureCommentAnalyzer.getInstructorFeedbackStats(
      user.id,
      query,
    );
    return stats;
  }

  @Get('courses/:course_id/lecture-comments/aspect-summary')
  @ApiAuth({
    summary: `Get instructor's lecture aspect distribution`,
    statusCode: HttpStatus.OK,
    type: Object,
  })
  async getAspectDistribution(
    @CurrentUser() user: JwtPayloadType,
    @Param('course_id') course_id: Nanoid,
    // @Query() query: PeriodReq,
  ) {
    const distribution =
      await this.lectureCommentAnalyzer.findInCourseAspects(course_id);
    return distribution;
  }

  @Get('instructors/lecture-comments/emotion-trend')
  @ApiAuth({
    summary: 'Aspect sentiment trend over time',
    statusCode: HttpStatus.OK,
    type: Object,
  })
  async getAspectTrend(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: TrendOverTimeQuery,
  ) {
    return this.lectureCommentAnalyzer.getEmotionTrendsOverTime(user.id, query);
  }
}
