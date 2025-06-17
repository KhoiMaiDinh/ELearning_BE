import { CursorPaginatedDto, Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtPayloadType } from '../token';
import { LectureCommentRes, PaginateLectureCommentsQuery } from './dto';
import { LectureCommentService } from './lecture-comment.service';

@Controller({ version: '1' })
export class LectureCommentController {
  constructor(private readonly lectureCommentService: LectureCommentService) {}

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
}
