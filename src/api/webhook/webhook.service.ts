import { AccountService } from '@/api/payment/services/account.service';
import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeEvent } from './enum/stripe-event.enum';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  private stripe: Stripe;
  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private readonly accountService: AccountService,
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
        'whsec_7G4txdcqI8AdkNrE8Y9w1I0lTcF0QALt',
      );
    } catch (err) {
      this.logger.error('Error verifying Stripe webhook:', err);
      throw new ValidationException(ErrorCode.V000);
    }
    this.logger.debug('Stripe webhook event:', event.type);

    switch (event.type) {
      case StripeEvent.ACCOUNT_UPDATED: {
        const account = event.data.object as Stripe.Account;
        await this.accountService.handleAccountUpdate(account);
        this.logger.debug('✅ Account updated:', account.id);
        break;
      }
      default:
        this.logger.warn(`ℹ️ Unhandled event type: ${event.type}`);
    }
  }
}
