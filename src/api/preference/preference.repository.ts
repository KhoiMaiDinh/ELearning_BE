import { Nanoid } from '@/common';
import { ErrorCode, Language } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PreferenceEntity } from './entities/preference.entity';

@Injectable()
export class PreferenceRepository extends Repository<PreferenceEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PreferenceEntity, dataSource.createEntityManager());
  }

  async getPreferenceByUserId(
    user_public_id: Nanoid,
  ): Promise<PreferenceEntity> {
    const preference = await this.createQueryBuilder('preference')
      .leftJoinAndSelect('preference.user', 'user')
      .leftJoinAndSelect('preference.categories', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'translation',
        'translation.language = :lang',
        {
          lang: Language.VI,
        },
      )
      .where('user.id = :userId', { userId: user_public_id })
      .getOne();

    if (!preference) {
      throw new NotFoundException(ErrorCode.E018);
    }
    return preference;
  }
}
