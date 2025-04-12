import {
  CourseQuery,
  CourseRes,
  CoursesQuery,
  CreateCourseReq,
  PublicCourseReq,
  UpdateCourseReq,
} from '@/api/course';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, ApiPublic, CurrentUser } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CourseService } from './services/course.service';
import { EnrollCourseService } from './services/enroll-course.service';

@Controller({ path: 'courses', version: '1' })
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly enrollCourseService: EnrollCourseService,
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
    summary: 'Get courses by cursor pagination',
    type: CourseRes,
  })
  async findMany(@Query() query: CoursesQuery) {
    return await this.courseService.findMany(query);
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
    return await this.courseService.findOne(id, query);
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
    return await this.courseService.changeStatus(id, user, dto);
  }

  @Get(':id/curriculums')
  @ApiPublic({
    statusCode: HttpStatus.OK,
    summary: 'Get course curriculums',
    type: CourseRes,
  })
  async findCurriculums(@Param('id') id: Nanoid | string) {
    return await this.courseService.findCurriculums(id);
  }

  @Get('enrolled/me')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    summary: 'Get my enrolled courses',
    type: CourseRes,
  })
  async getEnrolledCourses(@CurrentUser('id') user_id: Nanoid) {
    return await this.enrollCourseService.getEnrolledCourses(user_id);
  }

  // @Put(':id/curriculums')
  // @ApiAuth({
  //   statusCode: HttpStatus.CREATED,
  //   summary: 'Create or update a course curriculum',
  //   type: CurriculumRes,
  // })
  // async upsertCurriculum(
  //   @CurrentUser('id') user_id: Nanoid,
  //   @Param('id') course_id: Nanoid | string,
  //   @Body() dto: UpsertCurriculumReq,
  // ) {
  //   return await this.courseService.upsertCurriculum(user_id, course_id, dto);
  // }
}
