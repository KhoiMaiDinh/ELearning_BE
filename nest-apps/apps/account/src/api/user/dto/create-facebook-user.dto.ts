import { BadRequestException } from '@nestjs/common';
import { CreateUser } from './create-user.dto';
import { ErrorCode } from '@app/common';

export class CreateFacebookUser extends CreateUser {
  constructor(data?: CreateFacebookUser) {
    super();
    Object.assign(this, data);

    const errors: string[] = [];

    if (!this.profile_img) {
      errors.push('profile_img is required for registration with Facebook');
    }
    if (!this.facebook_id) {
      errors.push('facebook_id is required for registration with Facebook');
    }
    if (!this.email) {
      errors.push('email is required for registration with Facebook');
    }
    if (!this.first_name) {
      errors.push('first_name is required for registration with Facebook');
    }
    if (!this.last_name) {
      errors.push('last_name is required for registration with Facebook');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
        cause: ErrorCode.E051,
      });
    }
  }

  profile_img: string;
  facebook_id: string;
}
