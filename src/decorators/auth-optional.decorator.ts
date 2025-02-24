import { IS_AUTH_OPTIONAL } from '@/constants';
import { SetMetadata } from '@nestjs/common';

export const AuthOptional = () => SetMetadata(IS_AUTH_OPTIONAL, true);
