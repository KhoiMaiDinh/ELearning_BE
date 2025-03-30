import { MediaController } from '@/api/media';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { MediaRepository } from '@/api/media/media.repository';
import { MediaService } from '@/api/media/media.service';
import { MinioClientModule } from '@/libs/minio/minio-client.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [MinioClientModule, TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaRepository],
})
export class MediaModule {}
