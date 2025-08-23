import {
  OffsetPaginationDto,
  PageOffsetOptionsDto as PageOptionsDto,
} from '@/common';
import { SelectQueryBuilder } from 'typeorm';

export async function rawPaginate<T>(
  builder: SelectQueryBuilder<T>,
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>,
): Promise<[{ entities: T[]; raw: any[] }, OffsetPaginationDto]> {
  if (!options?.takeAll) {
    builder.skip(pageOptionsDto.offset).take(pageOptionsDto.limit);
  }

  const result: { entities: T[]; raw: any[] } =
    await builder.getRawAndEntities();

  let count = -1;

  if (!options?.skipCount) {
    count = await builder.getCount();
  }

  const metaDto = new OffsetPaginationDto(count, pageOptionsDto);

  return [result, metaDto];
}
