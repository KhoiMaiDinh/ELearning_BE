import { CategoryModule } from '@/api/category';
import { MinioClientModule } from '@/libs/minio/minio-client.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { InstructorEntity } from './entities/instructor.entity';
import { InstructorController } from './instructor.controller';
import { InstructorRepository } from './instructor.repository';
import { InstructorService } from './instructor.service';

@Module({
  imports: [
    UserModule,
    MinioClientModule,
    TypeOrmModule.forFeature([InstructorEntity]),
    forwardRef(() => CategoryModule),
  ],
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepository],
})
export class InstructorModule {}
