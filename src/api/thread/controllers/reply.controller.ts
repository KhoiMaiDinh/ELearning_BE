// reply-vote.controller.ts
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Controller, Delete, HttpStatus, Param, Post } from '@nestjs/common';
import { VoteService } from '../services/vote.service';

@Controller({ path: 'replies', version: '1' })
export class ReplyVoteController {
  constructor(private readonly voteService: VoteService) {}

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
}
