import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, SuccessBasicDto } from '@/common';
import { Permission } from '@/constants';
import { ApiAuth, CurrentUser, Permissions } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReportReq } from '../dto/report.req.dto';
import { ReviewReportReq } from '../dto/review-report.req.dto';
import { UserReportService } from '../services/user-report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: UserReportService) {}

  @ApiAuth({
    summary: 'Report content',
    statusCode: HttpStatus.CREATED,
  })
  @Post()
  async reportContent(
    @CurrentUser() user: UserEntity,
    @Body()
    req: ReportReq,
  ): Promise<SuccessBasicDto> {
    await this.reportService.createReport({
      ...req,
      reporter_id: user.id,
    });

    return {
      message: 'Báo cáo nội dung thành công',
      status_code: HttpStatus.CREATED,
    };
  }

  @ApiAuth({
    summary: 'Report content',
    statusCode: HttpStatus.CREATED,
  })
  @Permissions(Permission.READ_REPORT)
  @Get('pending')
  async getPendingReports() {
    return this.reportService.getPendingReports();
  }

  @ApiAuth({
    summary: 'Review Report content',
    statusCode: HttpStatus.OK,
  })
  @Patch(':report_id/review')
  async reviewReport(
    @Param('report_id') report_id: Nanoid,
    @Body() dto: ReviewReportReq,
  ) {
    return this.reportService.markReportAsReviewed(report_id, dto);
  }
}
