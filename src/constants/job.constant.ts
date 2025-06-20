export enum QueueName {
  EMAIL = 'email',
  PAYOUT = 'payout',
  ORDER = 'order',
  PROGRESS = 'progress',
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
  PAYOUT_FINALIZE = 'payout-finalize',
  HANDLE_ORDER_EXPIRATION = 'handle-order-expiration',
  COUPON_GIFT = 'coupon-gift',
  CHECK_PROGRESS = 'check-progress',
}
