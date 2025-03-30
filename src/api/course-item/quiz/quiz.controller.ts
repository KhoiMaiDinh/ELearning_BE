import {
  CreateQuizReq,
  QuizAnswerRes,
  QuizRes,
  SubmitQuizReq,
  UpdateQuizReq,
} from '@/api/course-item';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizService } from './quiz.service';

@Controller({ path: 'quizzes', version: '1' })
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizAttemptService: QuizAttemptService,
  ) {}

  @ApiAuth({
    summary: 'get course item: Quiz',
    statusCode: HttpStatus.OK,
    type: QuizRes,
  })
  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayloadType, @Param('id') id: Nanoid) {
    return await this.quizService.findOne(user, id);
  }

  @ApiAuth({
    summary: 'create course item: Quiz',
    statusCode: HttpStatus.CREATED,
  })
  @Post()
  async create(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateQuizReq,
  ) {
    return await this.quizService.create(user, dto);
  }

  @ApiAuth({
    summary: 'update course item: Quiz',
    statusCode: HttpStatus.OK,
  })
  @Put(':id')
  async update(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid,
    @Body() dto: UpdateQuizReq,
  ) {
    return await this.quizService.update(user, id, dto);
  }

  @ApiAuth({
    summary: 'Get Quiz Attempt',
    statusCode: HttpStatus.OK,
    type: QuizAnswerRes,
  })
  @Get(':id/attempts/me')
  async getMyAttempts(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid,
  ) {
    return await this.quizAttemptService.getByQuiz(user, id);
  }

  @ApiAuth({
    summary: 'Submit Quiz Attempt',
    statusCode: HttpStatus.OK,
  })
  @Post(':id/submit')
  async submit(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid,
    @Body() dto: SubmitQuizReq,
  ) {
    return await this.quizAttemptService.submit(user, id, dto);
  }
}
