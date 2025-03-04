export enum ErrorCode {
  // Common Validation
  V000 = 'common.validation.error',

  // Validation
  V001 = 'user.validation.is_empty',
  V002 = 'user.validation.is_invalid',
  V003 = 'file.validation.is_invalid',

  // Forbidden
  F001 = 'common.forbidden.error',

  // Internal Server
  I000 = 'common.internal_server.error',

  // Category
  E008 = 'category.error.category_not_found',
  E013 = 'category.error.invalid_parent_category',
  E014 = 'category.error.self_parenting',
  E015 = 'category.error.circular_dependency',
  E016 = 'category.error.delete_with_children',

  // User
  E001 = 'user.error.username_or_email_exists',
  E002 = 'user.error.not_found',
  E003 = 'user.error.email_exists',
  E004 = 'user.error.password_not_match',
  E005 = 'user.error.invalid_for_non_local_user',

  // Preference
  E018 = 'preference.error.not_found',

  // Instructor
  E011 = 'instructor.error.existed',
  E012 = 'instructor.error.not_found',
  E017 = 'instructor.error.invalid_specialized',

  // Token
  E009 = 'token.error.invalid_secret',
  E010 = 'token.error.expired',
  E020 = 'token.error.password_reset_token_not_found_or_invalid',
  E021 = 'token.error.password_reset_too_frequent',
  E022 = 'token.error.email_verification_too_frequent',
  E023 = 'token.error.email_verification_token_not_found_or_invalid',

  // Role
  E006 = 'role.error.not_found',

  // Permission
  E007 = 'permission.error.not_found',

  // Auth
  E055 = 'auth.error.facebook_token_expired',
  E056 = 'auth.error.facebook_token_invalid',
  E057 = 'auth.error.facebook_token_not_authorized',
  E058 = 'auth.error.google_token_invalid',
  E059 = 'auth.error.google_token_expire',
  E060 = 'auth.error.google_token_wrong_audience',

  // Storage
  E061 = 'storage.error.invalid_url',
}
