import { IS_PUBLIC } from '@/constants/index';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const Public: () => CustomDecorator = () => SetMetadata(IS_PUBLIC, true);
