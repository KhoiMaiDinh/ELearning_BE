export enum ErrorCode {
  // Common Validation
  V000 = 'common.validation.error',

  // Validation
  V001 = 'user.validation.is_empty',
  V002 = 'user.validation.is_invalid',
  V003 = 'file.validation.is_invalid',

  // Forbidden
  F001 = 'common.forbidden.error',
  F002 = 'common.forbidden.resource_owner',

  // Internal Server
  I000 = 'common.internal_server.error',

  // Enrolled Course
  E038 = 'enrolled_course.error.not_found',

  // Course
  E025 = 'course.error.not_found',
  E026 = 'course.error.invalid_category',
  E027 = 'course.error.cannot_modify',
  E028 = 'course.forbidden.view_disabled',
  E043 = 'course.error.invalid_publication',
  E046 = 'course.error.enroll_not_found',
  E047 = 'course.error.enroll_already_exists',
  E072 = 'course.error.enroll_own_course',

  // Order
  E044 = 'order.error.unpublish_course',
  E045 = 'order.error.not_found',

  // Section
  E029 = 'section.forbidden.author',
  E030 = 'section.error.not_found',
  E031 = 'section.error.cannot_delete',

  // Course Item
  E032 = 'course_item.error.author',
  E033 = 'course_item.error.not_found',
  E035 = 'course_item.error.position_not_found',
  E036 = 'course_item.error.invalid_quiz_answer_quantity',
  E037 = 'course_item.error.invalid_correct_quiz_answer',

  // Quiz Attempt
  E039 = 'quiz_attempt.error.invalid_question_list',

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

  // Media
  E019 = 'media.error.not_found',
  E034 = 'media.error.invalid_type',
  E042 = 'media.error.not_uploaded',

  // Preference
  E018 = 'preference.error.not_found',

  // Instructor
  E011 = 'instructor.error.existed',
  E012 = 'instructor.error.not_found',
  E017 = 'instructor.error.invalid_specialized',
  E041 = 'instructor.error.invalid_resume',

  // Account
  E048 = 'account.error.for_only_instructor',
  E049 = 'account.error.not_found',
  E050 = 'account.error.init_new',
  E051 = 'account.error.account_onboarded',
  E052 = 'account.error.account_unavailable',
  E053 = 'account.error.invalid_bank_code',

  // Token
  E009 = 'token.error.invalid_secret',
  E010 = 'token.error.expired',
  E020 = 'token.error.password_reset_token_not_found_or_invalid',
  E021 = 'token.error.password_reset_too_frequent',
  E022 = 'token.error.email_verification_too_frequent',
  E023 = 'token.error.email_verification_token_not_found_or_invalid',
  E024 = 'token.error.empty',
  E071 = 'token.error.blacklisted',

  // Payout
  E054 = 'payout.error.not_found',

  // Role
  E006 = 'role.error.not_found',

  // Permission
  E007 = 'permission.error.not_found',

  // Coupon
  E062 = 'coupon.error.coupon_course_required',
  E063 = 'coupon.error.creation_limit',
  E064 = 'coupon.error.usage_limit_exceeded',
  E065 = 'coupon.error.not_found',
  E066 = 'coupon.error.not_active',
  E067 = 'coupon.error.expired',
  E068 = 'coupon.error.not_valid_yet',
  E069 = 'coupon.error.cannot_modify',
  E070 = 'coupon.error.unapplicable',

  // Thread
  E040 = 'thread.error.not_found',

  // Auth
  E055 = 'auth.error.facebook_token_expired',
  E056 = 'auth.error.facebook_token_invalid',
  E057 = 'auth.error.facebook_token_not_authorized',
  E058 = 'auth.error.google_token_invalid',
  E059 = 'auth.error.google_token_expire',
  E060 = 'auth.error.google_token_wrong_audience',

  // Storage
  E061 = 'storage.error.invalid_url',

  // Comments
  E073 = 'comment.error.not_found',
}
