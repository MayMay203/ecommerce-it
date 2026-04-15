import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions =>
        config.get<JwtModuleOptions>('jwt') ?? {},
    }),
  ],
  controllers: [AuthController, RolesController, UsersController],
  providers: [
    AuthService,
    RolesService,
    RoleRepository,
    UsersService,
    UserRepository,
    RefreshTokenRepository,
    JwtStrategy,
  ],
  exports: [AuthService, RolesService, RoleRepository, UsersService, UserRepository, JwtModule],
})
export class AuthModule {}
