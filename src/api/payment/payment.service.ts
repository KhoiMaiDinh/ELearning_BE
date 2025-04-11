import { AllConfigType } from '@/config';
import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { CourseEntity } from '../course/entities/course.entity';
import { JwtPayloadType } from '../token';
import { UserEntity } from '../user/entities/user.entity';
import { AccountEntity } from './entities/account.entity';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async initAccount(jwt_payload: JwtPayloadType): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: jwt_payload.id },
      relations: ['instructor_profile'],
    });
    this.validateUser(user);
    // Step 1: Create Stripe Connected Express Account
    let country_code = 'VN';
    country_code = 'VN';
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: country_code,
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
        service_agreement: country_code == 'US' ? 'full' : 'recipient',
      },
    });

    // Step 2: Generate Stripe Account Onboarding Link
    const account_link = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://yourapp.com/onboarding/refresh`,
      return_url: `https://yourapp.com/onboarding/success?account_id=${account.id}`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    // Step 3: Save account.id to your database
    const new_account = this.accountRepo.create({
      user_id: user.user_id,
      stripe_account_id: account.id,
    });
    await this.accountRepo.save(new_account);

    // Step 4: Return onboarding link to frontend for redirect
    return account_link.url;
  }

  async initPaymentRequest(
    courses: CourseEntity[],
    order_id: string,
    customer_email: string,
  ): Promise<string> {
    const return_url = this.configService.get('payment.stripe_return_url', {
      infer: true,
    });
    const success_url = return_url + '/success';
    const cancel_url = return_url + '/cancel';

    const storage_url = this.configService.get('storage.path', {
      infer: true,
    });
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${success_url}?order_id=${order_id}`,
      cancel_url: `${cancel_url}?order_id=${order_id}`,
      payment_method_types: ['card'],
      customer_email: customer_email,
      metadata: {
        order_id,
      },
      line_items: courses.map((course) => ({
        price_data: {
          currency: 'vnd',
          unit_amount: Math.round(course.price),
          product_data: {
            name: course.title,
            images: [
              storage_url +
                '/' +
                course.thumbnail.bucket +
                '/' +
                course.thumbnail.key,
            ],
          },
        },
        quantity: 1,
      })),
    });
    return session.url;

    // const data: BuildPaymentUrl = {
    //   vnp_Amount: amount,
    //   vnp_CreateDate: dateFormat(new Date(), 'yyyyMMddHHmmss'),
    //   vnp_CurrCode: VnpCurrCode.VND,
    //   vnp_IpAddr: client_ip,
    //   vnp_Locale: VnpLocale.VN,
    //   vnp_OrderInfo: order_id,
    //   vnp_OrderType: ProductCode.Pay,
    //   vnp_ReturnUrl: return_url,
    //   vnp_TxnRef: order_id,
    // };

    // // const vnpay_url = this.vnpayService.buildPaymentUrl(data);
    // return vnpay_url;
  }

  private validateUser(user: UserEntity) {
    if (!user) throw new NotFoundException(ErrorCode.E002);
    if (!user.instructor_profile) throw new NotFoundException(ErrorCode.E048);
  }
}
