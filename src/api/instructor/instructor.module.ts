import { CategoryModule } from '@/api/category/category.module';
import { CertificateEntity } from '@/api/instructor/entities/certificate.entity';
import { InstructorEntity } from '@/api/instructor/entities/instructor.entity';
import { MediaModule } from '@/api/media/media.module';
import { UserModule } from '@/api/user/user.module';
import { MinioClientModule } from '@/libs/minio/minio-client.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorController } from './instructor.controller';
import { InstructorRepository } from './instructor.repository';
import { InstructorService } from './instructor.service';

@Module({
  imports: [
    forwardRef(() => CategoryModule),
    forwardRef(() => UserModule),
    MediaModule,
    MinioClientModule,
    TypeOrmModule.forFeature([InstructorEntity, CertificateEntity]),
  ],
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepository],
  exports: [InstructorRepository],
})
export class InstructorModule {}
