import { QueueName, QueuePrefix } from '@/constants/job.constant';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../role/entities/role.entity';
import { RoleRepository } from '../role/entities/role.repository';
import { TokenModule } from '../token/token.module';
import { UserEntity } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { OAuthService } from './services/oauth.service';
import { RegistrationService } from './services/registration.service';

@Module({
  imports: [
    UserModule,
    TokenModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    BullModule.registerQueue({
      name: QueueName.EMAIL,
      prefix: QueuePrefix.AUTH,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OAuthService, RegistrationService, RoleRepository],
})
export class AuthModule {}
