import { CursorPaginateRatingQuery, RatingResDto } from '@/api/course/dto';
import { RatingService } from '@/api/course/services/rating.service';
import { JwtPayloadType } from '@/api/token';
import { CursorPaginatedDto } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller({ version: '1' })
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get('instructors/ratings')
  @ApiAuth({
    summary: 'Get instructor ratings',
    statusCode: HttpStatus.OK,
  })
  async getInstructorRatings(
    @CurrentUser() user: JwtPayloadType,
    @Query() filter: CursorPaginateRatingQuery,
  ) {
    const { ratings, metaDto } = await this.ratingService.getInstructorRating(
      user,
      filter,
    );

    return new CursorPaginatedDto(
      plainToInstance(RatingResDto, ratings),
      metaDto,
    );
  }
}
