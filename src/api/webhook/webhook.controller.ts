import { ApiPublic, Public } from '@/decorators';
import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @ApiPublic({
    summary: 'Stripe webhook endpoint',
  })
  @Public()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.webhookService.handleStripeWebhook(signature, req.rawBody);
    return { received: true };
  }
}
