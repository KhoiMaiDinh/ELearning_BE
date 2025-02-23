import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';

@Module({
  imports: [UserModule],
  controllers: [InstructorController],
  providers: [InstructorService],
})
export class InstructorModule {}
