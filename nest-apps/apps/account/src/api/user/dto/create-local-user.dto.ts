import { BadRequestException } from '@nestjs/common';
import { CreateUser } from './create-user.dto';
import { ErrorCode } from '@app/common';

export class CreateLocalUser extends CreateUser {
  constructor(data?: CreateLocalUser) {
    super();
    Object.assign(this, data);

    const errors: string[] = [];

    if (!this.email) {
      errors.push('email is required for registration');
    }
    if (!this.first_name) {
      errors.push('first_name is required for registration');
    }
    if (!this.last_name) {
      errors.push('last_name is required for registration');
    }
    if (!this.password) {
      errors.push('password is required for registration');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
        cause: ErrorCode.E052,
      });
    }
  }

  password: string;
}
