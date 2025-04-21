export type PaymentConfig = {
  stripe_api_key: string;
  stripe_return_url: string;
  stripe_webhook_secret: string;
  vnp_tmn_code: string;
  vnp_hash_secret: string;
  vnp_url: string;
  vnp_return_url: string;
};
