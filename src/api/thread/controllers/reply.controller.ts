// reply-vote.controller.ts
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { PERMISSION } from '@/constants';
import { ApiAuth, CurrentUser, Permissions } from '@/decorators';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ReplyRes } from '../dto';
import { ReplyService } from '../services/reply.service';
import { VoteService } from '../services/vote.service';

@Controller({ path: 'replies', version: '1' })
export class ReplyVoteController {
  constructor(
    private readonly voteService: VoteService,
    private readonly replyService: ReplyService,
  ) {}

  @Post(':reply_id/upvote')
  @ApiAuth({ summary: 'Upvote a reply', statusCode: HttpStatus.NO_CONTENT })
  async upvote(
    @Param('reply_id') reply_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.voteService.upvote(reply_id, user);
  }

  @Delete(':reply_id/upvote')
  @ApiAuth({
    summary: 'Remove Upvote of a reply',
    statusCode: HttpStatus.NO_CONTENT,
  })
  async removeUpvote(
    @Param('reply_id') reply_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.voteService.removeUpvote(reply_id, user);
  }

  @Get(':reply_id')
  @ApiAuth({ summary: 'Get overview', statusCode: HttpStatus.OK })
  @Permissions(PERMISSION.READ_REPLY)
  async getReply(@Param('reply_id') reply_id: Nanoid) {
    const reply = await this.replyService.findOne(reply_id);
    return reply.toDto(ReplyRes);
  }
}
