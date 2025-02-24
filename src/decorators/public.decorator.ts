import { IS_PUBLIC } from '@/constants';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const Public: () => CustomDecorator = () => SetMetadata(IS_PUBLIC, true);
