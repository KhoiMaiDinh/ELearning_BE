import { MinioClientModule } from '@/libs/minio/minio-client.module';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { InstructorController } from './instructor.controller';
import { InstructorRepository } from './instructor.repository';
import { InstructorService } from './instructor.service';

@Module({
  imports: [UserModule, MinioClientModule],
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepository],
})
export class InstructorModule {}
