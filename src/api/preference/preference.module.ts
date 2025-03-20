import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenceEntity } from './entities/preference.entity';
import { PreferenceController } from './preference.controller';
import { PreferenceRepository } from './preference.repository';
import { PreferenceService } from './preference.service';

@Module({
  imports: [TypeOrmModule.forFeature([PreferenceEntity])],
  controllers: [PreferenceController],
  providers: [PreferenceService, PreferenceRepository],
})
export class PreferenceModule {}
