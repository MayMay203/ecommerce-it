import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IUserPayload {
  sub: number;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as IUserPayload;
  },
);
