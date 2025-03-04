import {
  SessionEntity,
  UserController,
  UserEntity,
  UserRepository,
  UserService,
} from '@/api/user';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
  controllers: [UserController],
  exports: [UserService, UserRepository],
  providers: [UserService, UserRepository],
})
export class UserModule {}
