import { RoleModule } from '@/api/role';
import { TokenModule } from '@/api/token';
import { UserModule } from '@/api/user';
import { QueueName, QueuePrefix } from '@/constants';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { OAuthService } from './services/oauth.service';
import { RegistrationService } from './services/registration.service';

@Module({
  imports: [
    UserModule,
    TokenModule,
    RoleModule,
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
  providers: [AuthService, OAuthService, RegistrationService],
})
export class AuthModule {}
