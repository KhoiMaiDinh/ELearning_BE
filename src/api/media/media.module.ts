import { MediaController, MediaService } from '@/api/media';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { MediaRepository } from '@/api/media/media.repository';
import { MinioClientModule } from '@/libs/minio';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [MinioClientModule, TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaRepository],
})
export class MediaModule {}
