export enum QueueName {
  EMAIL = 'email',
  PAYOUT = 'payout',
  ORDER = 'order',
}

export enum QueuePrefix {
  AUTH = 'auth',
  EVENT = 'event',
  PAYOUT = 'payout',
}

export enum JobName {
  EMAIL_VERIFICATION = 'email-verification',
  FORGOT_PASSWORD = 'forgot-password',
  PAYOUT_INSTRUCTOR = 'payout-instructor',
  HANDLE_ORDER_EXPIRATION = 'handle-order-expiration',
  COUPON_GIFT = 'coupon-gift',
}
