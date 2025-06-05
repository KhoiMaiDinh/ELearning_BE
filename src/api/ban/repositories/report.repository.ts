import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserReportEntity } from '../entities/user-report.entity';

@Injectable()
export class ReportRepository extends Repository<UserReportEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserReportEntity, dataSource.createEntityManager());
  }
}
