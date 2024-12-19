// Libs
import { Module } from '@nestjs/common';

// Common
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
})
export class ApiModule {}
