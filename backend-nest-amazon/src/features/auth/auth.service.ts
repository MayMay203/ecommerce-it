import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IUserPayload } from '../../shared/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { User } from './entities/user.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';

const SALT_ROUNDS = 10;
const CUSTOMER_ROLE = 'customer';
const REFRESH_TOKEN_TTL_DAYS = 7;

export interface IDeviceInfo {
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ILoginResult {
  accessToken: string;
  rawRefreshToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    this.logger.log(`Registering user: ${dto.email}`);

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('AUTH_005');
    }

    const customerRole = await this.roleRepository.findByName(CUSTOMER_ROLE);
    if (!customerRole) {
      throw new NotFoundException('Customer role not configured');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.userRepository.create({
      email: dto.email,
      password: passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      isActive: true,
      roleId: customerRole.id,
    });
  }

  async login(dto: LoginDto, deviceInfo: IDeviceInfo = {}): Promise<ILoginResult> {
    this.logger.log(`Login attempt: ${dto.email}`);

    const user = await this.userRepository.findByEmailWithRole(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('AUTH_001');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('AUTH_001');
    }

    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = await this.createRefreshToken(user.id, deviceInfo);

    return { accessToken, rawRefreshToken, user };
  }

  async refresh(rawToken: string): Promise<{ accessToken: string }> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!record || record.isRevoked || record.expiresAt < new Date()) {
      throw new UnauthorizedException('AUTH_002');
    }

    const user = await this.userRepository.findById(record.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('AUTH_003');
    }

    return { accessToken: this.generateAccessToken(user) };
  }

  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
  }

  async getMe(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMe(userId: number, dto: UpdateMeDto): Promise<User> {
    this.logger.log(`Updating profile for user #${userId}`);
    await this.getMe(userId);

    const updateData: Partial<User> = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone ?? null;

    const updated = await this.userRepository.update(userId, updateData);
    return updated!;
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    this.logger.log(`Changing password for user #${userId}`);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userRepository.update(userId, { password: newHash });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private generateAccessToken(user: User): string {
    const payload: IUserPayload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name ?? CUSTOMER_ROLE,
    };
    return this.jwtService.sign(payload);
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(userId: number, deviceInfo: IDeviceInfo): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      deviceName: deviceInfo.deviceName ?? null,
      ipAddress: deviceInfo.ipAddress ?? null,
      userAgent: deviceInfo.userAgent ?? null,
      expiresAt,
      isRevoked: false,
    });

    return rawToken;
  }
}
