import { Nanoid, SuccessBasicDto } from '@/common';
import { ApiAuth, CurrentUser } from '@/decorators';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { JwtPayloadType } from '../token';
import { NotificationQuery } from './dto';
import { NotificationService } from './notification.service';

@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiAuth({
    summary: 'Get all notifications for user',
    statusCode: HttpStatus.OK,
  })
  async getAllForUser(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: NotificationQuery,
  ) {
    const notifications = await this.notificationService.getUserNotifications(
      user.id,
      query,
    );
    return notifications;
  }

  @Patch(':id/seen')
  @ApiAuth({
    summary: 'Mark notification as seen',
    statusCode: HttpStatus.OK,
  })
  async markSeen(
    @Param('id') id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<SuccessBasicDto> {
    await this.notificationService.markAsRead(user.id, id);
    return {
      message: 'Notification marked as seen',
      status_code: HttpStatus.OK,
    };
  }

  @Patch('seen-all')
  @ApiAuth({
    summary: 'Mark all notifications as seen',
    statusCode: HttpStatus.OK,
  })
  async markAllSeen(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<SuccessBasicDto> {
    await this.notificationService.markAllAsRead(user.id);
    return {
      message: 'All notifications marked as seen',
      status_code: HttpStatus.OK,
    };
  }
}
