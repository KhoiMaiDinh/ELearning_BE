import { PriceHistoryRepository } from '@/api/price/price-history.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceService {
  constructor(
    private readonly priceHistoryRepository: PriceHistoryRepository,
  ) {}
}
