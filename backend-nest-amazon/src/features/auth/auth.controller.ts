import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { IUserPayload } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ---------------------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------------------

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'customer',
      },
      message: 'Registration successful',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = {
      ipAddress: (req.headers['x-forwarded-for'] as string) ?? req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const { accessToken, rawRefreshToken, user } = await this.authService.login(dto, deviceInfo);

    res.cookie(REFRESH_COOKIE, rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_TTL_MS,
    });

    return {
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role?.name ?? 'customer',
        },
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using httpOnly cookie' })
  async refresh(@Req() req: Request) {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!rawToken) {
      return { data: { accessToken: null }, message: 'No refresh token' };
    }
    const { accessToken } = await this.authService.refresh(rawToken);
    return { data: { accessToken } };
  }

  // ---------------------------------------------------------------------------
  // Protected endpoints
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token and clear cookie' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(rawToken ?? '');
    res.clearCookie(REFRESH_COOKIE);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: IUserPayload) {
    const data = await this.authService.getMe(user.sub);
    return { data, message: 'Profile retrieved successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: IUserPayload, @Body() dto: UpdateMeDto) {
    const data = await this.authService.updateMe(user.sub, dto);
    return { data, message: 'Profile updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@CurrentUser() user: IUserPayload, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.sub, dto);
    return { message: 'Password changed successfully' };
  }

}
