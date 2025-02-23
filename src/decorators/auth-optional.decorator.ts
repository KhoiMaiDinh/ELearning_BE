import { IS_AUTH_OPTIONAL } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const AuthOptional = () => SetMetadata(IS_AUTH_OPTIONAL, true);
