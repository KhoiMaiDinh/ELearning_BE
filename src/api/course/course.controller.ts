import { ApiAuth } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseReq } from './dto/create-course.dto.req';
import { UpdateCourseReq } from './dto/update-course.dto';

@Controller({ path: 'courses', version: '1' })
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiAuth({
    statusCode: HttpStatus.CREATED,
    summary: 'Init a new course',
  })
  async create(@Body() dto: CreateCourseReq) {
    return await this.courseService.create(dto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseReq) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
