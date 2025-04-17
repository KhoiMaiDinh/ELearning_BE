import { CourseService } from '@/api/course/services/course.service';
import { JwtPayloadType } from '@/api/token';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid } from '@/common';
import { ErrorCode, Permission } from '@/constants';
import { ForbiddenException, ValidationException } from '@/exceptions';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { AccountRes } from '../dto/account.res.dto';
import { InitStripeConnectAccountReq } from '../dto/init-stripe-connect-account.req.dto';
import { UpdateStripeAccountReq } from '../dto/update-stripe-account.req.dto';
import { AccountEntity } from '../entities/account.entity';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly stripe: Stripe;

  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    private readonly userRepo: UserRepository,
    private readonly courseService: CourseService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async initAccount(
    jwt_payload: JwtPayloadType,
    data: InitStripeConnectAccountReq,
  ): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: jwt_payload.id },
      relations: ['instructor_profile', 'accounts'],
    });
    this.validateUser(user);
    const stripe_account = await this.stripe.accounts.create({
      type: 'express',
      country: data.country_code,
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        mcc: '5815',
        name: user.first_name + ' ' + user.last_name,
        product_description: 'E-Learning Course',
        support_email: user.email,
        url: 'https://yourapp.dev',
      },
      tos_acceptance: {
        service_agreement: data.country_code == 'US' ? 'full' : 'recipient',
      },
    });

    // Step 2: Generate Stripe Account Onboarding Link
    const account_link = await this.createOnboardingLink(stripe_account.id);

    // Step 3: Save account.id to your database
    const new_account = this.accountRepo.create({
      user_id: user.user_id,
      stripe_account_id: stripe_account.id,
      label: data.label,
    });
    await this.accountRepo.save(new_account);

    // Step 4: Return onboarding link to frontend for redirect
    return account_link;
  }

  async refreshAccount(
    jwt_payload: JwtPayloadType,
    account_id: string,
  ): Promise<string> {
    const account = await this.accountRepo.findOne({
      where: { stripe_account_id: account_id },
      relations: ['user'],
    });
    if (!account) throw new NotFoundException(ErrorCode.E049);

    const is_enabled =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;
    if (is_enabled) throw new ValidationException(ErrorCode.E051);

    if (account.user.id !== jwt_payload.id)
      throw new ForbiddenException(ErrorCode.F002);

    const account_link = await this.createOnboardingLink(
      account.stripe_account_id,
    );
    return account_link;
  }

  async createOnboardingLink(account_id: string): Promise<string> {
    const account_link = await this.stripe.accountLinks.create({
      account: account_id,
      refresh_url: `https://yourapp.com/onboarding/refresh`,
      return_url: `https://yourapp.com/onboarding/success?account_id=${account_id}`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });
    return account_link.url;
  }

  async findFromUsers(
    user: JwtPayloadType,
    user_id: Nanoid,
  ): Promise<AccountRes[]> {
    const accounts = await this.accountRepo.find({
      where: { user: { id: user_id } },
      order: { is_default: 'DESC', createdAt: 'ASC' },
      relations: ['user'],
    });

    if (accounts.length === 0) return [];

    this.assertPermission(accounts[0], user, [Permission.READ_ACCOUNT]);

    return plainToInstance(AccountRes, accounts);
  }

  async updateAccount(
    user: JwtPayloadType,
    stripe_account_id: string,
    dto: UpdateStripeAccountReq,
  ): Promise<AccountRes> {
    const account = await this.accountRepo.findOne({
      where: { stripe_account_id },
      relations: ['user'],
    });
    if (!account) throw new NotFoundException(ErrorCode.E049);

    this.assertPermission(account, user, [Permission.WRITE_ACCOUNT]);

    account.label = dto.label;
    if (dto.is_default) await this.setDefaultStatus(account);
    await this.accountRepo.save(account);
    return account.toDto(AccountRes);
  }

  async handleAccountUpdate(account: Stripe.Account) {
    const db_account = await this.accountRepo.findOne({
      where: { stripe_account_id: account.id },
      relations: ['user'],
    });

    if (!db_account) return;

    const { is_default: was_default } = db_account;
    const is_enabled =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;

    if (!is_enabled && was_default) {
      // Unpublish all courses and remove default status if account is default

      db_account.is_default = false;
      await this.courseService.unpublishManyByInstructor(db_account.user_id);
    }

    db_account.charges_enabled = is_enabled;
    db_account.payouts_enabled = account.payouts_enabled;
    db_account.details_submitted = account.details_submitted;
    await this.accountRepo.save(db_account);
  }

  private validateUser(user: UserEntity) {
    if (!user) throw new NotFoundException(ErrorCode.E002);
    if (!user.instructor_profile) throw new NotFoundException(ErrorCode.E048);
  }

  private async setDefaultStatus(account: AccountEntity): Promise<void> {
    if (account.is_default) return;
    // Check if valid to be default

    const is_enabled =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;
    if (!is_enabled) throw new ValidationException(ErrorCode.E052);

    const user_id = account.user_id;

    const current_default = await this.accountRepo.findOne({
      where: { user_id, is_default: true },
    });

    await this.accountRepo.update({ user_id: user_id }, { is_default: false });
    await this.accountRepo.update(
      { account_id: account.account_id },
      { is_default: true },
    );
    account.is_default = true;

    if (!current_default) {
      await this.courseService.republishManyByInstructor(account.user.user_id);
    }
  }

  private assertPermission(
    account: AccountEntity,
    user: JwtPayloadType,
    permissions: Permission[],
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
