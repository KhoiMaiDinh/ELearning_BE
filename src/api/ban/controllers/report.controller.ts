import { JwtPayloadType } from '@/api/token';
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
  Query,
} from '@nestjs/common';
import { ReportQuery } from '../dto/report.query.dto';
import { ReportReq } from '../dto/report.req.dto';
import { ReviewReportReq } from '../dto/review-report.req.dto';
import { UserReportService } from '../services/user-report.service';

@Controller({ path: 'reports', version: '1' })
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
    statusCode: HttpStatus.OK,
  })
  @Permissions(Permission.READ_REPORT)
  @Get()
  async getPendingReports(@Query() query: ReportQuery) {
    return this.reportService.find(query);
  }

  @ApiAuth({
    summary: 'Review Report content',
    statusCode: HttpStatus.OK,
  })
  @Patch(':report_id/review')
  async reviewReport(
    @Param('report_id') report_id: Nanoid,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: ReviewReportReq,
  ) {
    return this.reportService.markReportAsReviewed(report_id, user, dto);
  }
}
