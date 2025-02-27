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
} from '@nestjs/common';
import { ApproveInstructorDto } from './dto/approve-instructor.dto';
import { InstructorRes } from './dto/instructor.res.dto';
import { ListInstructorReq } from './dto/list-instructor.req.dto';
import { RegisterAsInstructorReq } from './dto/register-as-instructor.req.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InstructorService } from './instructor.service';

@Controller('instructor')
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
  load(@Body() dto: ListInstructorReq) {
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
    @Body() dto: UpdateInstructorDto,
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
