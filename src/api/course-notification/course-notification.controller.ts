import { Nanoid, PageOffsetOptionsDto } from '@/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CourseAnnouncementService } from './course-notification.service';
import { CreateCourseNotificationReq } from './dto';

@Controller({ path: 'courses', version: '1' })
export class CourseNotificationController {
  constructor(private notificationService: CourseAnnouncementService) {}

  @Post(':course_id/notifications')
  async create(
    @Param('course_id') course_id: Nanoid,
    @Body() dto: CreateCourseNotificationReq,
  ) {
    return this.notificationService.create(course_id, dto);
  }

  @Get(':course_id/notifications')
  async findAll(
    @Param('course_id') course_id: Nanoid,
    @Query() query: PageOffsetOptionsDto,
  ) {
    return this.notificationService.findFromCourse(course_id, query);
  }

  @Delete(':course_id/notifications')
  async delete(@Param('course_id') course_id: Nanoid) {
    return this.notificationService.delete(course_id);
  }
}
