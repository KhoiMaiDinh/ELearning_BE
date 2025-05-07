import { RecommenderService } from '@/api/recommender/recommender.service';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, ApiPublic, CurrentUser } from '@/decorators';
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CourseRes } from '../course';
import { RecommendCourseQuery } from './dto';

@Controller({ path: 'recommendations', version: '1' })
export class RecommenderController {
  constructor(private readonly recommenderService: RecommenderService) {}

  @Get('courses/:course_id/similar')
  @ApiPublic({
    summary: 'Get similar courses',
    statusCode: HttpStatus.OK,
  })
  async getSimilarCourses(@Param('course_id') course_id: Nanoid) {
    return this.recommenderService.findSimilarCourses(course_id);
  }

  @Get('courses')
  @ApiAuth({
    summary: 'Get recommendations for user',
    statusCode: HttpStatus.OK,
  })
  async getRecommendationsForUser(
    @Query() query: RecommendCourseQuery,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const courses = await this.recommenderService.recommendCoursesForUser(
      user.id,
      query,
    );
    return plainToInstance(CourseRes, courses);
  }
}
