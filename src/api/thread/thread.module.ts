import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseModule } from '@/api/course/course.module';
import { UserModule } from '@/api/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplyVoteController } from './controllers/reply.controller';
import { ThreadController } from './controllers/thread.controller';
import { ReplyVoteEntity } from './entities/reply-vote.entity';
import { ReplyEntity } from './entities/reply.entity';
import { ThreadEntity } from './entities/thread.entity';
import { ReplyService } from './services/reply.service';
import { ThreadService } from './services/thread.service';
import { VoteService } from './services/vote.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThreadEntity, ReplyEntity, ReplyVoteEntity]),
    UserModule,
    forwardRef(() => CourseItemModule),
    forwardRef(() => CourseModule),
  ],
  controllers: [ThreadController, ReplyVoteController],
  providers: [ReplyService, ThreadService, VoteService],
  exports: [ThreadService],
})
export class ThreadModule {}
