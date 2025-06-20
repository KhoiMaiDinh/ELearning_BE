import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseModule } from '@/api/course/course.module';
import { UserModule } from '@/api/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorModule } from '../instructor/instructor.module';
import { ReplyVoteController } from './controllers/reply.controller';
import { ThreadController } from './controllers/thread.controller';
import { ReplyVoteEntity } from './entities/reply-vote.entity';
import { ReplyEntity } from './entities/reply.entity';
import { ThreadEntity } from './entities/thread.entity';
import { ReplyRepository } from './repositories/reply.repository';
import { ThreadRepository } from './repositories/thread.repository';
import { ReplyService } from './services/reply.service';
import { ThreadService } from './services/thread.service';
import { VoteService } from './services/vote.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThreadEntity, ReplyEntity, ReplyVoteEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => CourseItemModule),
    forwardRef(() => CourseModule),
    InstructorModule,
  ],
  controllers: [ThreadController, ReplyVoteController],
  providers: [
    ReplyService,
    ThreadService,
    VoteService,
    ReplyRepository,
    ThreadRepository,
  ],
  exports: [ThreadService, ReplyRepository, ThreadRepository],
})
export class ThreadModule {}
