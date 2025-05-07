import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
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
    const preference = await this.findOne({
      where: { user: { id: user_public_id } },
      relations: { user: true, categories: true },
    });

    if (!preference) {
      throw new NotFoundException(ErrorCode.E018);
    }
    return preference;
  }
}
