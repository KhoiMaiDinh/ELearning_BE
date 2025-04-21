import { MediaRepository } from '@/api/media';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { OrderDetailService } from '@/api/order/services/order-detail.service';
import { Nanoid, OffsetPaginatedDto, Uuid } from '@/common';
import { Bucket, ErrorCode, UploadStatus } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { paginate } from '@/utils';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PayoutQuery } from '../dto/payout.query.dto';
import { PayoutRes } from '../dto/payout.res.dto';
import { UpdatePayoutReq } from '../dto/update-payout.req.dto';
import { PayoutEntity } from '../entities/payout.entity';
import { PayoutStatus } from '../enums/payment-status.enum';

export class PayoutService {
  private logger = new Logger(PayoutService.name);
  constructor(
    @InjectRepository(PayoutEntity)
    private readonly payoutRepo: Repository<PayoutEntity>,
    private readonly orderDetailService: OrderDetailService,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async initForInstructor(instructor_id: Uuid): Promise<void> {
    const items =
      await this.orderDetailService.findPayableByInstructor(instructor_id);

    if (items.length === 0) throw new NotFoundException(ErrorCode.V000);

    const instructor = items[0].course.instructor;
    const account = instructor.user.account;

    const total_amount = items.reduce(
      (sum, item) => sum + Math.round(item.final_price - item.platform_fee),
      0,
    );

    const payout_report = this.payoutRepo.create({
      amount: total_amount,
      bank_account_number: account.bank_account_number,
      bank_code: account.bank_code,
      payout_status: PayoutStatus.PENDING,
      payee: instructor.user,
    });

    await this.payoutRepo.save(payout_report);

    for (const item of items) {
      item.payout = payout_report;
    }

    await this.orderDetailService.save(items);
    this.logger.debug(
      `Created Payout ${total_amount} VND to instructor ${instructor.user.username} successfully`,
    );
  }

  async find(query: PayoutQuery): Promise<OffsetPaginatedDto<PayoutRes>> {
    const query_builder = this.payoutRepo.createQueryBuilder('payout');

    if (query.status) {
      query_builder.andWhere('payout.payout_status = :status', {
        status: query.status,
      });
    }

    const [payouts, metaDto] = await paginate<PayoutEntity>(
      query_builder,
      query,
      {
        skipCount: false,
        takeAll: false,
      },
    );

    return new OffsetPaginatedDto(plainToInstance(PayoutRes, payouts), metaDto);
  }

  async update(id: Nanoid, dto: UpdatePayoutReq) {
    const payout = await this.payoutRepo.findOneBy({ id });

    if (!payout) throw new NotFoundException(ErrorCode.E054);

    const evidence = await this.mediaRepository.findOneById(dto.evidence.id);
    this.validateEvidence(evidence);

    Object.assign(payout, dto);
    payout.paid_out_sent_at = new Date();
    payout.evidence = evidence;

    await this.payoutRepo.save(payout);

    return payout.toDto(PayoutRes);
  }

  private validateEvidence(evidence: MediaEntity) {
    if (evidence.bucket !== Bucket.IMAGE)
      throw new ValidationException(ErrorCode.E034);
    if (
      evidence.status !== UploadStatus.UPLOADED &&
      evidence.status !== UploadStatus.VALIDATED
    )
      throw new ValidationException(ErrorCode.E042);
  }
}
