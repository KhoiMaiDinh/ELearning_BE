import { IntersectionType } from '@nestjs/swagger';
import { MonthQuery, YearQuery } from './date-time.query.dto';

export class GetOverviewQuery extends IntersectionType(YearQuery, MonthQuery) {}
export class GetRevenueQuery extends IntersectionType(YearQuery) {}
export class GetGrowthQuery extends IntersectionType(YearQuery) {}
