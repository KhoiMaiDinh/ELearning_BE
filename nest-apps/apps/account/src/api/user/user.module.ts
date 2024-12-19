import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserInfo } from './entities/teacher-profile.entity';
import { UtilityService } from './services/utility.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User, UserInfo])],
  controllers: [UserController],
  providers: [UserService, UtilityService],
  exports: [UserService],
})
export class UserModule {}
