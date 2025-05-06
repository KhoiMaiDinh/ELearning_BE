import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReplyReq } from '../dto';
import { ReplyEntity } from '../entities/reply.entity';
import { ReplyRepository } from '../repositories/reply.repository';
import { ThreadRepository } from '../repositories/thread.repository';

@Injectable()
export class ReplyService {
  constructor(
    private readonly replyRepo: ReplyRepository,

    private readonly threadRepo: ThreadRepository,
    private readonly enrolledRepo: EnrolledCourseRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async create(
    author: JwtPayloadType,
    dto: CreateReplyReq,
  ): Promise<ReplyEntity> {
    const thread = await this.threadRepo.findOne({
      where: { id: dto.thread_id },
      relations: { lecture: { section: true } },
    });
    if (!thread) throw new NotFoundException(ErrorCode.E040);

    const enrolled = await this.enrolledRepo.findOne({
      where: {
        user: { id: author.id },
        course: { course_id: thread.lecture.section.course_id },
      },
      relations: { course: true, user: true },
    });
    if (!enrolled) throw new NotFoundException(ErrorCode.E038);

    const reply = this.replyRepo.create({
      content: dto.content,
      thread,
      author: enrolled.user,
    });

    return this.replyRepo.save(reply);
  }

  async getByThread(
    user_payload: JwtPayloadType,
    thread_id: Nanoid,
  ): Promise<ReplyEntity[]> {
    const user = await this.userRepo.findOneByPublicId(user_payload.id);
    const replies = await this.replyRepo
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.author', 'author')
      .leftJoinAndSelect('author.profile_image', 'profile_image')
      .leftJoin('reply.thread', 'thread')
      .leftJoin('reply.votes', 'votes') // All votes (for count)
      .leftJoin(
        'reply.votes',
        'user_vote',
        'user_vote.user_id = :current_user_id',
        { current_user_id: user.user_id },
      ) // Only current user's vote
      .where('thread.id = :thread_id', { thread_id })
      .groupBy('reply.reply_id, author.user_id, profile_image.media_id')
      .addSelect('COUNT(votes.reply_vote_id)', 'vote_count')
      .addSelect(
        'CASE WHEN COUNT(user_vote.reply_vote_id) > 0 THEN true ELSE false END',
        'has_upvoted',
      )
      .orderBy('vote_count', 'DESC')
      .getRawAndEntities()
      .then(({ entities, raw }) => {
        return entities.map((entity, i) => ({
          ...entity,
          vote_count: parseInt(raw[i].vote_count, 10),
          has_upvoted:
            raw[i].has_upvoted === 'true' || raw[i].has_upvoted === true,
        }));
      });

    return replies as unknown as ReplyEntity[];
  }
}
