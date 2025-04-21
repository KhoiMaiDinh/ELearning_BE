export enum QueueName {
  EMAIL = 'email',
  STRIPE = 'stripe',
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
}
