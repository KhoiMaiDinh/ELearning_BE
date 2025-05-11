import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, OffsetPaginatedDto } from '@/common';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import ms from 'ms';
import { MoreThan, Repository } from 'typeorm';
import { BanQuery } from '../dto';
import { BanRes } from '../dto/ban.res.dto';
import { UserBanEntity } from '../entities/user-ban.entity';
import { WarningEntity } from '../entities/warning.entity';

@Injectable()
export class UserBanService {
  constructor(
    @InjectRepository(UserBanEntity)
    private readonly banRepo: Repository<UserBanEntity>,
  ) {}

  async banUser(
    user: UserEntity,
    active_warnings?: WarningEntity[],
  ): Promise<UserBanEntity> {
    let expires_at: Date | null;
    const active_bans = await this.banRepo.find({
      where: { user: { user_id: user.user_id }, is_active: true },
    });

    if (active_bans.length == 0) expires_at = new Date(Date.now() + ms('30d'));
    else if (active_bans.length == 1)
      expires_at = new Date(Date.now() + ms('60d'));
    else expires_at = null;

    const ban = this.banRepo.create({
      user,
      expires_at,
      is_active: true,
      warnings: active_warnings,
    });

    return await this.banRepo.save(ban);
  }

  async unbanUser(user_id: Nanoid): Promise<void> {
    await this.banRepo
      .createQueryBuilder()
      .update()
      .set({ is_active: false })
      .where('user.id = :user_id', { user_id })
      .andWhere('is_active = true')
      .execute();
  }

  async getUserBanned(user_id: Nanoid): Promise<UserBanEntity> {
    const active_ban = await this.banRepo.findOne({
      where: [
        { user: { id: user_id }, is_active: true, expires_at: null },
        {
          user: { id: user_id },
          is_active: true,
          expires_at: MoreThan(new Date()),
        },
      ],
      relations: { user: true },
    });
    return active_ban;
  }

  async getBanInfo(user_id: Nanoid): Promise<UserBanEntity | null> {
    return this.banRepo.findOne({
      where: { user: { id: user_id }, is_active: true },
      relations: { user: true },
    });
  }

  async find(query: BanQuery): Promise<OffsetPaginatedDto<BanRes>> {
    const query_builder = this.banRepo
      .createQueryBuilder('user')
      .orderBy('user.createdAt', query.order)
      .leftJoinAndSelect('user.roles', 'role');

    const [ban_infos, metaDto] = await paginate<UserBanEntity>(
      query_builder,
      query,
      {
        skipCount: false,
        takeAll: false,
      },
    );
    return new OffsetPaginatedDto(plainToInstance(BanRes, ban_infos), metaDto);
  }
}
