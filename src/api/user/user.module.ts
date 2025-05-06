import { BanModule } from '@/api/ban/ban.module';
import { MediaModule } from '@/api/media/media.module';
import { SessionEntity } from '@/api/user/entities/session.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserController } from '@/api/user/user.controller';
import { UserRepository } from '@/api/user/user.repository';
import { UserService } from '@/api/user/user.service';
import { MinioClientModule } from '@/libs/minio';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => MediaModule),
    forwardRef(() => BanModule),
    MinioClientModule,
    forwardRef(() => TypeOrmModule.forFeature([UserEntity, SessionEntity])),
  ],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserRepository, UserService],
})
export class UserModule {}
