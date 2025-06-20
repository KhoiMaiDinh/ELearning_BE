import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { PreferenceEntity } from './entities/preference.entity';
import { PreferenceController } from './preference.controller';
import { PreferenceRepository } from './preference.repository';
import { PreferenceService } from './preference.service';

@Module({
  imports: [
    forwardRef(() => TypeOrmModule.forFeature([PreferenceEntity])),
    CategoryModule,
  ],
  controllers: [PreferenceController],
  providers: [PreferenceService, PreferenceRepository],
  exports: [PreferenceRepository],
})
export class PreferenceModule {}
