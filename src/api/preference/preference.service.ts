import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { InternalServerException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { PreferenceRes } from './dto';
import { UpdatePreferenceReq } from './dto/update-preference.req.dto';
import { PreferenceRepository } from './preference.repository';

@Injectable()
export class PreferenceService {
  constructor(private readonly preferenceRepository: PreferenceRepository) {}
  async findOneOfUser(user_public_id: Nanoid): Promise<PreferenceRes> {
    try {
      const preference =
        await this.preferenceRepository.getPreferenceByUserId(user_public_id);
      return preference.toDto(PreferenceRes);
    } catch {
      throw new InternalServerException(ErrorCode.I000);
    }
  }

  async update(user_public_id: Nanoid, dto: UpdatePreferenceReq) {
    const preference =
      await this.preferenceRepository.getPreferenceByUserId(user_public_id);
    Object.assign(preference, dto);
    await this.preferenceRepository.save(preference);

    return preference.toDto(PreferenceRes);
  }
}
