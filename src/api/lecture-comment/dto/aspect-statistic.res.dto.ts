import { ClassField, NumberField } from '@/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { LectureCommentRes } from './lecture-comment.res.dto';

@Exclude()
export class AspectStatisticsRes {
  @Expose()
  @NumberField({ int: true })
  positive: number;

  @Expose()
  @NumberField({ int: true })
  neutral: number;

  @Expose()
  @NumberField({ int: true })
  negative: number;
}

@Exclude()
export class FindLectureCommentsRes {
  @Expose()
  @ClassField(() => LectureCommentRes, { each: true })
  comments: LectureCommentRes[];

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'object', $ref: AspectStatisticsRes.name },
    example: {
      content_quality: {
        positive: 3,
        neutral: 1,
        negative: 0,
      },
      instructor_quality: {
        positive: 2,
        neutral: 0,
        negative: 1,
      },
    },
  })
  @Expose()
  statistics: Record<string, AspectStatisticsRes>;
}
