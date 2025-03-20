import { Nanoid } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApproveInstructorDto,
  InstructorRes,
  ListInstructorQuery,
  RegisterAsInstructorReq,
  UpdateInstructorReq,
} from './dto';
import { InstructorService } from './instructor.service';

@Controller({ path: 'instructors', version: '1' })
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Post()
  @ApiAuth()
  @HttpCode(HttpStatus.CREATED)
  async registerAsInstructor(
    @CurrentUser('id') user_public_id: Nanoid,
    @Body() dto: RegisterAsInstructorReq,
  ): Promise<InstructorRes> {
    const instructor = await this.instructorService.create(user_public_id, dto);
    return instructor;
  }

  @Get()
  @ApiAuth({
    type: InstructorRes,
    summary: 'List instructor',
    isPaginated: true,
  })
  load(@Query() dto: ListInstructorQuery) {
    return this.instructorService.load(dto);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.instructorService.findOneByUsername(username);
  }

  @Put(':username')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    type: InstructorRes,
    summary: 'Update instructor profile',
  })
  update(
    @Param('username') username: string,
    @Body() dto: UpdateInstructorReq,
  ): Promise<InstructorRes> {
    return this.instructorService.update(username, dto);
  }

  @Post(':username/approve')
  @ApiAuth({
    statusCode: HttpStatus.OK,
    type: InstructorRes,
    summary: 'Approve instructor',
  })
  async approve(
    @CurrentUser('id') id: Nanoid,
    @Param('username') username: string,
    @Body() dto: ApproveInstructorDto,
  ): Promise<InstructorRes> {
    return await this.instructorService.approve(username, id, dto);
  }
}
