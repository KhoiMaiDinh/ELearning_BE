import {
  OffsetPaginationDto,
  PageOffsetOptionsDto as PageOptionsDto,
} from '@/common';
import { SelectQueryBuilder } from 'typeorm';

export async function paginate<T>(
  builder: SelectQueryBuilder<T>,
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>,
): Promise<[T[], OffsetPaginationDto]> {
  if (!options?.takeAll) {
    builder.skip(pageOptionsDto.offset).take(pageOptionsDto.limit);
  }

  const entities: T[] = await builder.getMany();

  let count = -1;

  if (!options?.skipCount) {
    count = await builder.getCount();
  }

  const metaDto = new OffsetPaginationDto(count, pageOptionsDto);

  return [entities, metaDto];
}
