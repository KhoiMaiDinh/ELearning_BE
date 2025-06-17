import {
  CourseQuery,
  CourseRes,
  CoursesQuery,
  CreateCourseReq,
  CurriculumQuery,
  CurriculumRes,
  FavoriteCourseRes,
  PublicCourseReq,
  RequestCourseUnbanReq,
  ReviewUnbanReq,
  UnbanRequestQuery,
  UpdateCourseReq,
} from '@/api/course';
import { JwtPayloadType } from '@/api/token';
import { Nanoid, OffsetPaginatedDto, SuccessBasicDto } from '@/common';
import { PERMISSION } from '@/constants';
import { ApiAuth, ApiPublic, CurrentUser, Permissions } from '@/decorators';
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
import { CourseReviewRes } from '../dto/review.res.dto';
import { SubmitReviewReq } from '../dto/submit-review.req.dto';
import { CourseUnbanResponseDto } from '../dto/unban-request.res.dto';
import { CourseModerationService } from '../services/course-moderation.service';
import { CourseService } from '../services/course.service';
import { EnrollCourseService } from '../services/enroll-course.service';
import { FavoriteCourseService } from '../services/favorite-course.service';

@Controller({ path: 'courses', version: '1' })
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly enrollCourseService: EnrollCourseService,
    private readonly moderationService: CourseModerationService,
    private readonly favoriteCourseService: FavoriteCourseService,
  ) {}

  @Post()
  @ApiAuth({
    statusCode: HttpStatus.CREATED,
    summary: 'Init a new course',
  })
  async create(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateCourseReq,
  ) {
    return await this.courseService.create(user.id, dto);
  }

  @Get()
  @ApiPublic({
    statusCode: HttpStatus.OK,
    summary: 'Get courses by offset pagination',
    type: CourseRes,
    isPaginated: true,
  })
  async findMany(@Query() query: CoursesQuery) {
    return await this.courseService.find(query);
  }

  @Get('me')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get my courses ',
    type: CourseRes,
  })
  async findMyCourses(@CurrentUser() user: JwtPayloadType) {
    return await this.courseService.findFromUser(user);
  }

  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get pending unban requests for a course',
    type: CourseUnbanResponseDto,
  })
  @Get('unban-requests')
  async getUnbanRequests(@Query() query: UnbanRequestQuery) {
    const { course_with_unban_requests, meta } =
      await this.moderationService.getUnbanRequests(query);
    return new OffsetPaginatedDto(
      plainToInstance(CourseRes, course_with_unban_requests),
      meta,
    );
  }

  @Get(':id')
  @ApiPublic({
    statusCode: HttpStatus.OK,
    summary: 'Get a course by id or slug',
    type: CourseRes,
  })
  async findOne(
    @Param('id') id: Nanoid | string,
    @Query() query: CourseQuery,
  ): Promise<CourseRes> {
    const course = await this.courseService.findOne(id, query);
    return course.toDto(CourseRes);
  }

  @Put(':id')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Update a course',
    type: CourseRes,
  })
  async update(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid | string,
    @Body() updateCourseDto: UpdateCourseReq,
  ) {
    return await this.courseService.update(id, user, updateCourseDto);
  }

  @Patch(':id/status')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Change course status',
    type: CourseRes,
  })
  async changeCourseStatus(
    @Body() dto: PublicCourseReq,
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid | string,
  ) {
    return await this.courseService.publish(id, user, dto);
  }

  @Get(':id/curriculums')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get course curriculums',
    type: CourseRes,
  })
  async findCurriculums(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid | string,
    @Query() query: CurriculumQuery,
  ) {
    const { course: curriculum, course_progress } =
      await this.courseService.findCurriculums(user, id, query);
    return plainToInstance(CurriculumRes, {
      ...curriculum,
      course_progress,
    });
  }

  @Get('enrolled/me')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get my enrolled courses',
    type: CourseRes,
  })
  async getEnrolledCourses(@CurrentUser('id') user_id: Nanoid) {
    return await this.courseService.findEnrolled(user_id);
  }

  @Post(':course_id/review')
  @ApiAuth({
    statusCode: HttpStatus.CREATED,
    summary: 'Submit a review',
    type: CourseReviewRes,
  })
  async submitReview(
    @Param('course_id') course_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: SubmitReviewReq,
  ) {
    return await this.enrollCourseService.submitOrUpdateReview(
      user.id,
      course_id,
      dto,
    );
  }

  @Get(':course_id/reviews')
  @ApiPublic({
    statusCode: HttpStatus.OK,
    summary: 'Get course reviews',
    type: CourseReviewRes,
  })
  async getReviews(@Param('course_id') course_id: Nanoid) {
    const reviews = await this.enrollCourseService.getCourseReviews(course_id);
    return reviews;
  }

  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get my review',
    type: CourseReviewRes,
  })
  @Get(':course_id/reviews/me')
  async getMyReview(
    @Param('course_id') course_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const review = await this.enrollCourseService.getMyReview(
      user.id,
      course_id,
    );
    return review;
  }

  @ApiAuth({
    statusCode: HttpStatus.CREATED,
    summary: 'Request course unban',
    type: CourseUnbanResponseDto,
  })
  @Post(':course_id/unban-requests')
  async requestUnban(
    @Param('course_id') course_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: RequestCourseUnbanReq,
  ) {
    const unban_request = await this.moderationService.requestUnban(
      course_id,
      user,
      dto,
    );
    return unban_request.toDto(CourseUnbanResponseDto);
  }

  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get pending unban requests for a course',
    type: CourseUnbanResponseDto,
  })
  @Get(':course_id/unban-requests')
  async getUnbanRequestsOfCourse(@Param('course_id') course_id: Nanoid) {
    const requests =
      await this.moderationService.getCourseUnbanRequests(course_id);
    return plainToInstance(CourseUnbanResponseDto, requests);
  }

  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Review course unban request',
    type: CourseUnbanResponseDto,
  })
  @Patch(':course_id/unban')
  @Permissions(PERMISSION.WRITE_COURSE)
  async reviewRequest(
    @Param('course_id') course_id: Nanoid,
    @Body() dto: ReviewUnbanReq,
  ): Promise<SuccessBasicDto> {
    await this.moderationService.reviewUnbanRequest(course_id, dto);
    return plainToInstance(SuccessBasicDto, { message: 'Request done' });
  }

  @Post(':course_id/favorites')
  @ApiAuth({
    statusCode: HttpStatus.CREATED,
    summary: 'Add course to favorites',
    type: FavoriteCourseRes,
  })
  async addFavorite(
    @CurrentUser('id') user_id: Nanoid,
    @Param('course_id') course_id: Nanoid,
  ) {
    const favorite = await this.favoriteCourseService.add(user_id, course_id);
    return favorite.toDto(FavoriteCourseRes);
  }

  @Delete(':course_id/favorites')
  @ApiAuth({
    statusCode: HttpStatus.NO_CONTENT,
    summary: 'Remove course from favorites',
  })
  async removeFavorite(
    @CurrentUser('id') user_id: Nanoid,
    @Param('course_id') course_id: Nanoid,
  ) {
    await this.favoriteCourseService.remove(user_id, course_id);
  }

  @Get('favorites/me')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get my favorite courses',
    type: CourseRes,
  })
  async listFavorites(@CurrentUser('id') user_id: Nanoid) {
    const favorite_list = await this.favoriteCourseService.list(user_id);
    return plainToInstance(CourseRes, favorite_list);
  }
}
