import { MediaRepository } from '@/api/media';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { NotificationType } from '@/api/notification/enum/notification-type.enum';
import { PayoutBatchMetadata } from '@/api/notification/interfaces/metadata.interface';
import { NotificationBuilderService } from '@/api/notification/notification-builder.service';
import { NotificationService } from '@/api/notification/notification.service';
import { OrderDetailService } from '@/api/order/services/order-detail.service';
import { JwtPayloadType } from '@/api/token';
import { UserService } from '@/api/user/user.service';
import { Nanoid, OffsetPaginatedDto, Uuid } from '@/common';
import { Bucket, ErrorCode, UploadStatus } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { paginate } from '@/utils';
import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PayoutQuery } from '../dto/payout.query.dto';
import { PayoutRes } from '../dto/payout.res.dto';
import { UpdatePayoutReq } from '../dto/update-payout.req.dto';
import { PayoutEntity } from '../entities/payout.entity';
import { PayoutStatus } from '../enums/payment-status.enum';
import { PayoutRepository } from '../repositories/payout.repository';
import { AccountService } from './account.service';

@Injectable()
export class PayoutService {
  private logger = new Logger(PayoutService.name);
  constructor(
    private readonly payoutRepo: PayoutRepository,
    private readonly orderDetailService: OrderDetailService,
    private readonly mediaRepository: MediaRepository,
    private readonly accountService: AccountService,
    private readonly userService: UserService,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async finalize(batch: PayoutBatchMetadata) {
    await this.sendRequestNotification(batch);
  }

  private async sendRequestNotification(batch: PayoutBatchMetadata) {
    const admins = await this.userService.findAdmins();
    const built_notification = this.notificationBuilder.payoutGenerated(batch);
    for (const admin of admins) {
      const notification = await this.notificationService.save(
        admin.user_id,
        NotificationType.PAYOUT_GENERATED,
        batch,
        {
          title: built_notification.title,
          body: built_notification.body,
        },
      );
      this.notificationGateway.emitToUser(admin.id, {
        ...notification,
        ...built_notification,
      });
    }
  }

  async initForInstructor(instructor_id: Uuid): Promise<void> {
    const items =
      await this.orderDetailService.findPayableByInstructor(instructor_id);

    if (items.length === 0) throw new NotFoundException(ErrorCode.V000);

    const instructor = items[0].course.instructor;

    const account = instructor.user.account;
    if (!account) return;

    const total_amount = items.reduce(
      (sum, item) => sum + Math.round(item.final_price - item.platform_fee),
      0,
    );

    const payout_report = this.payoutRepo.create({
      amount: total_amount,
      bank_account_number: account?.bank_account_number ?? null,
      bank_code: account?.bank_code ?? null,
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
    const query_builder = this.payoutRepo
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.payee', 'payee')
      .leftJoinAndSelect('payee.account', 'account');

    if (query.status) {
      query_builder.andWhere('payout.payout_status = :status', {
        status: query.status,
      });
    }

    query_builder.orderBy('payout.createdAt', query.order);

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

  async findFromUser(
    user_id: Nanoid,
    filter: PayoutQuery,
  ): Promise<OffsetPaginatedDto<PayoutRes>> {
    const qb = this.payoutRepo
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.payee', 'payee')
      .leftJoinAndSelect('payee.account', 'account')
      .leftJoinAndSelect('payout.evidence', 'evidence')
      .where('payee.id = :user_id', { user_id });

    if (filter.status) {
      qb.andWhere('payout.payout_status = :status', { status: filter.status });
    }

    qb.orderBy('payout.createdAt', filter.order || 'DESC');

    const [payouts, meta] = await paginate<PayoutEntity>(qb, filter, {
      skipCount: false,
      takeAll: false,
    });

    const payout_ids = payouts.map((p) => p.payout_id);
    if (payout_ids.length === 0) {
      return new OffsetPaginatedDto(plainToInstance(PayoutRes, payouts), meta);
    }

    const contribution_map =
      await this.orderDetailService.findPayoutCourseContribution(payout_ids);

    const results = payouts.map((payout) =>
      plainToInstance(PayoutRes, {
        ...payout,
        contributions: contribution_map.get(payout.payout_id) ?? [],
      }),
    );

    return new OffsetPaginatedDto(results, meta);
  }

  async update(user_payload: JwtPayloadType, id: Nanoid, dto: UpdatePayoutReq) {
    const payout = await this.payoutRepo.findOne({
      where: { id },
      relations: { payee: true },
    });

    if (!payout) throw new NotFoundException(ErrorCode.E054);
    const user_bank_account = await this.accountService.findFromUser(
      user_payload,
      payout.payee.id,
    );

    if (dto.payout_status === PayoutStatus.SENT) {
      const evidence = await this.mediaRepository.findOneById(dto.evidence.id);
      this.validateEvidence(evidence);
      payout.evidence = evidence;
      payout.transaction_code = dto.transaction_code;
      payout.bank_account_number = user_bank_account.bank_account_number;
      payout.failure_reason = null;
    } else if (dto.payout_status === PayoutStatus.FAILED) {
      payout.failure_reason = dto.failure_reason;
      payout.evidence = null;
      payout.transaction_code = null;

      payout.bank_account_number = user_bank_account.bank_account_number;
    }
    payout.payout_status = dto.payout_status;
    payout.issued_at = new Date();

    await this.payoutRepo.save(payout);
    await this.sendPayoutProcessedNotification(payout);

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

  private async sendPayoutProcessedNotification(payout: PayoutEntity) {
    const built_notification = this.notificationBuilder.payoutProcessed(payout);
    const notification = await this.notificationService.save(
      payout.payee.user_id,
      NotificationType.PAYOUT_PROCESSED,
      { payout_id: payout.id },
      built_notification,
    );
    this.notificationGateway.emitToUser(payout.payee.id, {
      ...notification,
      ...built_notification,
    });
  }
}
