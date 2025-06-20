import { JwtPayloadType } from '@/api/token';
import { CursorPaginatedDto, Nanoid } from '@/common';
import { ApiAuth, ApiPublic, CurrentUser } from '@/decorators';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  CreateReplyReq,
  CreateThreadDto,
  CursorThreadsQuery,
  ReplyRes,
  ThreadRes,
} from '../dto';
import { ReplyService } from '../services/reply.service';
import { ThreadService } from '../services/thread.service';

@Controller({ path: 'threads', version: '1' })
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly replyService: ReplyService,
  ) {}

  @Get('instructors')
  @ApiAuth({
    summary: 'Get threads of instructors',
    type: ThreadRes,
  })
  async getInstructorThreads(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: CursorThreadsQuery,
  ) {
    const { threads, metaDto } = await this.threadService.getFromInstructor(
      user,
      query,
    );

    return new CursorPaginatedDto(plainToInstance(ThreadRes, threads), metaDto);
  }

  @Post()
  @ApiAuth({
    summary: 'Create a thread',
    type: ThreadRes,
  })
  async createThread(
    @Body() dto: CreateThreadDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const thread = await this.threadService.create(user, dto);
    return thread.toDto(ThreadRes);
  }

  @Get(':thread_id')
  @ApiPublic({
    summary: 'Get a thread',
    type: ThreadRes,
  })
  async getThread(
    @Param('thread_id') thread_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const thread = await this.threadService.getOne(thread_id);
    return thread.toDto(ThreadRes);
  }

  @Post(':thread_id/replies')
  @ApiAuth({
    summary: 'Create a reply',
    type: ThreadRes,
  })
  async createReply(
    @Param('thread_id') thread_id: Nanoid,
    @Body() dto: CreateReplyReq,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const reply = await this.replyService.create(user, { ...dto, thread_id });
    return reply.toDto(ReplyRes);
  }

  @Get(':thread_id/replies')
  @ApiAuth({
    summary: 'Get replies of a thread',
    type: ThreadRes,
  })
  async getReplies(
    @Param('thread_id') thread_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const replies = await this.replyService.getByThread(user, thread_id);
    return plainToInstance(ReplyRes, replies);
  }
}
