import { BadRequestException } from '@nestjs/common';
import { CreateUser } from './create-user.dto';
import { ErrorCode } from '@app/common';

export class CreateGoogleUser extends CreateUser {
  constructor(data?: CreateGoogleUser) {
    super();
    Object.assign(this, data);

    const errors: string[] = [];

    if (!this.google_id) {
      errors.push('google_id is required for registration with Google');
    }
    if (!this.email) {
      errors.push('email is required for registration with Google');
    }
    if (!this.first_name) {
      errors.push('first_name is required for registration with Google');
    }
    if (!this.last_name) {
      errors.push('last_name is required for registration with Google');
    }
    if (!this.profile_img) {
      errors.push('profile_img is required for registration with Google');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
        cause: ErrorCode.E052,
      });
    }
  }

  google_id: string;
  profile_img: string;
}
