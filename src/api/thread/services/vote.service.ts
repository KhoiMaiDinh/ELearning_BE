import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReplyVoteEntity } from '../entities/reply-vote.entity';
import { ReplyRepository } from '../repositories/reply.repository';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(ReplyVoteEntity)
    private readonly voteRepo: Repository<ReplyVoteEntity>,

    private readonly replyRepo: ReplyRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async upvote(reply_id: Nanoid, user_payload: JwtPayloadType): Promise<void> {
    const existing = await this.voteRepo.findOne({
      where: { reply: { id: reply_id }, user: { id: user_payload.id } },
      relations: { reply: true, user: true },
    });
    if (existing) return;

    const user = await this.userRepo.findOne({
      where: { id: user_payload.id },
    });
    const reply = await this.replyRepo.findOne({
      where: { id: reply_id },
    });
    const vote = this.voteRepo.create({
      reply,
      user,
    });
    await this.voteRepo.save(vote);
  }

  async removeUpvote(reply_id: Nanoid, user: JwtPayloadType): Promise<void> {
    const vote = await this.voteRepo.findOne({
      where: { reply: { id: reply_id }, user: { id: user.id } },
    });
    if (!vote) return;

    await this.voteRepo.remove(vote);
  }
}
