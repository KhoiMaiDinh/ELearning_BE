import { CourseEntity } from '@/api/course/entities/course.entity';
import { Nanoid } from '@/common';
import { AllConfigType } from '@/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async initRequest(
    courses: CourseEntity[],
    order_id: Nanoid,
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
  }
}
