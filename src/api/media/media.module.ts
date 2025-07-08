import { MediaController } from '@/api/media';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { MediaRepository } from '@/api/media/media.repository';
import { MediaService } from '@/api/media/media.service';
import { KafkaModule } from '@/kafka';
import { MinioClientModule } from '@/libs/minio/minio-client.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [
    MinioClientModule,
    TypeOrmModule.forFeature([MediaEntity]),
    KafkaModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, UserRepository],
  exports: [MediaRepository],
})
export class MediaModule {}
