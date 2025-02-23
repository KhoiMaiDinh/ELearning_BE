export enum CacheKey {
  SESSION_BLACKLIST = 'auth:session-blacklist:%s', // %s: sessionId
  EMAIL_VERIFICATION = 'auth:token:%s:email-verification', // %s: userId
  EMAIL_VERIFICATION_TIME = 'auth:date-time:%s:email-verification', // %s: userId
  PASSWORD_RESET = 'auth:token:%s:password', // %s: userId
  PASSWORD_RESET_TIME = 'auth:date-time:%s:password', // %s: userId
}
