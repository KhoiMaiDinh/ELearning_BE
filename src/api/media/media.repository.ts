import { ErrorCode, UploadStatus } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository, UpdateResult } from 'typeorm';
import { MediaEntity } from './entities/media.entity';

@Injectable()
export class MediaRepository extends Repository<MediaEntity> {
  constructor(dataSource: DataSource) {
    super(MediaEntity, dataSource.createEntityManager());
  }

  async findOneByKey(key: string): Promise<MediaEntity> {
    const decoded_key = decodeURIComponent(key);
    const media = await this.findOneBy({ key: decoded_key });

    if (!media) throw new NotFoundException(ErrorCode.E019);

    return media;
  }

  async findManyByKeys(keys: string[]): Promise<MediaEntity[]> {
    const result = await this.findAndCountBy({ key: In(keys) });
    if (result[1] !== keys.length) throw new NotFoundException(ErrorCode.E019);
    return result[0];
  }

  async updateMediaStatus(
    key: string,
    status: UploadStatus,
    rejection_reason?: string,
  ): Promise<UpdateResult> {
    const decoded_key = decodeURIComponent(key);
    return await this.update(
      { key: decoded_key },
      { status, rejection_reason },
    );
  }
}
