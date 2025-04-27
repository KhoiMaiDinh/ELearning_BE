import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators';
import { Aspect, Emotion } from '../enum';

export class LectureCommentsQuery {
  @EnumFieldOptional(() => Aspect)
  aspect?: Aspect;

  @EnumFieldOptional(() => Emotion)
  emotion?: Emotion;

  @BooleanFieldOptional({
    description: 'Filter by solved/unsolved status (optional)',
  })
  is_solved?: boolean;
}
