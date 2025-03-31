import { CoursePriceHistoryEntity } from '@/api/price/entities/price-history.entity';
import { PriceHistoryRepository } from '@/api/price/price-history.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePriceHistoryEntity])],
  providers: [PriceHistoryRepository],
  exports: [PriceHistoryRepository],
})
export class PriceModule {}
