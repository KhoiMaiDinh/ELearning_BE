import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies: ReturnType<typeof createParamDecorator> =
  createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  });
