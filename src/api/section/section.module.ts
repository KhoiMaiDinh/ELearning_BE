import { CourseModule } from '@/api/course/course.module';
import { SectionEntity } from '@/api/section/entities/section.entity';
import { SectionController } from '@/api/section/section.controller';
import { SectionRepository } from '@/api/section/section.repository';
import { SectionService } from '@/api/section/section.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [CourseModule, TypeOrmModule.forFeature([SectionEntity])],
  controllers: [SectionController],
  providers: [SectionService, SectionRepository],
  exports: [SectionRepository],
})
export class SectionModule {}
