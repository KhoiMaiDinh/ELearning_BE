import { StripeAccountService } from '@/api/payment/services/stripe-account.service';
import { Nanoid } from '@/common';
import { AllConfigType } from '@/config';
import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrderService } from '../order/services/order.service';
import { StripeEvent } from './enum/stripe-event.enum';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  private stripe: Stripe;
  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private readonly accountService: StripeAccountService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly orderService: OrderService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get('payment.stripe_webhook_secret', {
          infer: true,
        }),
      );
    } catch (err) {
      this.logger.error('Error verifying Stripe webhook:', err);
      throw new ValidationException(ErrorCode.V000);
    }
    this.logger.debug('Stripe webhook event:', event.type);

    switch (event.type) {
      case StripeEvent.ACCOUNT_UPDATED: {
        await this.handleAccountUpdateEvent(event);
        break;
      }
      case StripeEvent.CHECKOUT_SESSION_COMPLETED: {
        await this.handleCheckoutSessionCompletedEvent(event);
        break;
      }
      case StripeEvent.CHECKOUT_SESSION_EXPIRED:
        {
          this.logger.debug(
            '[STRIPE-WEBHOOK] Checkout session expired:',
            event.data.object,
          );
          // Handle session expiration (e.g., notify the user or update the database)
          break;
        }

        break;
      default:
        this.logger.warn(
          `[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`,
        );
    }
  }

  async handleAccountUpdateEvent(event: Stripe.Event): Promise<void> {
    const account = event.data.object as Stripe.Account;
    await this.accountService.handleAccountUpdate(account);
    this.logger.debug('[STRIPE-WEBHOOK] Account updated:', account.id);
  }

  async handleCheckoutSessionCompletedEvent(
    event: Stripe.Event,
  ): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const { payment_status, customer, metadata } = session;

    this.logger.debug(
      '[STRIPE-WEBHOOK] Checkout session completed:',
      event.data.object,
    );

    if (payment_status === 'paid') {
      this.logger.debug(
        `[STRIPE-WEBHOOK] Payment was successful for customer: ${customer}`,
      );
      await this.orderService.markOrderAsPaid(metadata.order_id as Nanoid);
      // Send email to
    } else {
      this.logger.warn(
        '[STRIPE-WEBHOOK] Payment status is not successful:',
        payment_status,
      );
    }
  }
}
