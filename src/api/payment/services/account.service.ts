import { AccountEntity } from '@/api/payment/entities/account.entity';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid } from '@/common';
import { ErrorCode, PERMISSION } from '@/constants';
import { ForbiddenException, NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRes } from '../dto/account.res.dto';
import { CreateAccountReq } from '../dto/create-account.req.dto';
import { UpdateAccountReq } from '../dto/update-account.req.dto';
import { VnpayPaymentService } from './vnpay-payment.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    private readonly userRepository: UserRepository,
    private readonly paymentService: VnpayPaymentService,
  ) {}

  async findFromUser(
    user_payload: JwtPayloadType,
    user_id: Nanoid,
  ): Promise<AccountRes> {
    const account = await this.accountRepo.findOne({
      where: { user: { id: user_id } },
      relations: { user: true },
    });
    if (!account) throw new NotFoundException(ErrorCode.E049);

    this.assertPermission(account, user_payload, [PERMISSION.READ_ACCOUNT]);

    return account.toDto(AccountRes);
  }

  async create(
    user_payload: JwtPayloadType,
    data: CreateAccountReq,
  ): Promise<AccountRes> {
    const user = await this.userRepository.findOneByPublicId(user_payload.id);
    const { name, bank_code, bank_account_number } = data;

    await this.paymentService.validateBankCode(bank_code);

    const account = this.accountRepo.create({
      user,
      name,
      bank_code,
      bank_account_number,
    });
    await this.accountRepo.save(account);

    return account.toDto(AccountRes);
  }

  async update(
    user_payload: JwtPayloadType,
    user_id: Nanoid,
    data: UpdateAccountReq,
  ): Promise<AccountRes> {
    const account = await this.accountRepo.findOne({
      where: { user: { id: user_id } },
      relations: { user: true },
    });

    if (!account)
      throw new NotFoundException(ErrorCode.E049, 'Account not registered yet');

    this.assertPermission(account, user_payload, [PERMISSION.WRITE_ACCOUNT]);

    const { name, bank_code, bank_account_number } = data;
    await this.paymentService.validateBankCode(bank_code);

    account.name = name;
    account.bank_code = bank_code;
    account.bank_account_number = bank_account_number;
    await this.accountRepo.save(account);

    return account.toDto(AccountRes);
  }

  private assertPermission(
    account: AccountEntity,
    user: JwtPayloadType,
    permissions: PERMISSION[],
  ): void {
    const is_owner = account.user.id === user.id;
    const has_permission = permissions.some((permission) =>
      user.permissions.includes(permission),
    );

    if (!is_owner && !has_permission) {
      throw new ForbiddenException(ErrorCode.F002);
    }
  }
}
