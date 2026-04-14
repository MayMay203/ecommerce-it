import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET ?? 'changeme',
    signOptions: {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as StringValue,
    },
  }),
);
