import { Nanoid } from '@/common/index';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RegisterAsInstructorReq } from './dto/register-as-instructor.req.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
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
  ) {
    const instructor = await this.instructorService.create(user_public_id, dto);
    return instructor;
  }

  @Get()
  findAll() {
    return this.instructorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.instructorService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorService.remove(+id);
  }
}
