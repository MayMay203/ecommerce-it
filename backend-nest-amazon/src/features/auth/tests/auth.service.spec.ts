import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import type { Role } from '../entities/role.entity';
import type { User } from '../entities/user.entity';
import type { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RoleRepository } from '../repositories/role.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../auth.service';

jest.mock('bcrypt');

const mockUserRepository = {
  findByEmail: jest.fn(),
  findByEmailWithRole: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockRefreshTokenRepository = {
  findByTokenHash: jest.fn(),
  create: jest.fn(),
  revokeByTokenHash: jest.fn(),
  revokeAllForUser: jest.fn(),
};

const mockRoleRepository = {
  findByName: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const roleStub = (overrides: Partial<Role> = {}): Role =>
  ({ id: 2, name: 'customer', users: [], ...overrides } as Role);

const userStub = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'alice@example.com',
    password: 'hashed_password',
    firstName: 'Alice',
    lastName: 'Smith',
    phone: null,
    isActive: true,
    roleId: 2,
    role: roleStub(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as User);

const tokenStub = (overrides: Partial<RefreshToken> = {}): RefreshToken =>
  ({
    id: 1,
    userId: 1,
    tokenHash: 'abc123hash',
    deviceName: null,
    ipAddress: null,
    userAgent: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  } as RefreshToken);

// ---------------------------------------------------------------------------

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('register', () => {
    const dto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should hash password and create user with customer role', async () => {
      // Arrange
      const role = roleStub();
      const created = userStub({ id: 2, email: 'new@example.com' });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(role);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new');
      mockUserRepository.create.mockResolvedValue(created);

      // Act
      const result = await service.register(dto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('customer');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          password: 'hashed_new',
          roleId: role.id,
          isActive: true,
        }),
      );
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(userStub());

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer role is not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('login', () => {
    const dto = { email: 'alice@example.com', password: 'password123' };

    it('should return accessToken, rawRefreshToken and user on valid credentials', async () => {
      // Arrange
      const user = userStub();
      mockUserRepository.findByEmailWithRole.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('signed_access_token');
      mockRefreshTokenRepository.create.mockResolvedValue(tokenStub());

      // Act
      const result = await service.login(dto);

      // Assert
      expect(mockUserRepository.findByEmailWithRole).toHaveBeenCalledWith('alice@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
      expect(result.accessToken).toBe('signed_access_token');
      expect(result.rawRefreshToken).toBeDefined();
      expect(result.user).toEqual(user);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockUserRepository.findByEmailWithRole.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockUserRepository.findByEmailWithRole.mockResolvedValue(userStub());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      mockUserRepository.findByEmailWithRole.mockResolvedValue(userStub({ isActive: false }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('refresh', () => {
    it('should return new accessToken for valid token', async () => {
      // Arrange
      const user = userStub();
      const record = tokenStub();
      mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(record);
      mockUserRepository.findById.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('new_access_token');

      // Act
      const result = await service.refresh('raw_valid_token');

      // Assert
      expect(result.accessToken).toBe('new_access_token');
    });

    it('should throw UnauthorizedException when token record not found', async () => {
      // Arrange
      mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refresh('unknown_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is revoked', async () => {
      // Arrange
      mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
        tokenStub({ isRevoked: true }),
      );

      // Act & Assert
      await expect(service.refresh('revoked_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      // Arrange
      mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
        tokenStub({ expiresAt: new Date('2020-01-01') }),
      );

      // Act & Assert
      await expect(service.refresh('expired_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('logout', () => {
    it('should revoke the refresh token by hash', async () => {
      // Arrange
      mockRefreshTokenRepository.revokeByTokenHash.mockResolvedValue(undefined);

      // Act
      await service.logout('raw_token');

      // Assert
      expect(mockRefreshTokenRepository.revokeByTokenHash).toHaveBeenCalledTimes(1);
    });

    it('should be a no-op when token is empty string', async () => {
      // Act
      await service.logout('');

      // Assert
      expect(mockRefreshTokenRepository.revokeByTokenHash).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('getMe', () => {
    it('should return user by id', async () => {
      // Arrange
      const user = userStub();
      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await service.getMe(1);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getMe(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('updateMe', () => {
    it('should update and return the user', async () => {
      // Arrange
      const dto = { firstName: 'Updated' };
      const updated = userStub({ firstName: 'Updated' });
      mockUserRepository.findById.mockResolvedValue(userStub());
      mockUserRepository.update.mockResolvedValue(updated);

      // Act
      const result = await service.updateMe(1, dto);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ firstName: 'Updated' }),
      );
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateMe(99, { firstName: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('changePassword', () => {
    it('should hash new password and update user', async () => {
      // Arrange
      const dto = { currentPassword: 'oldpass', newPassword: 'newpass123' };
      mockUserRepository.findById.mockResolvedValue(userStub());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');
      mockUserRepository.update.mockResolvedValue(undefined);

      // Act
      await service.changePassword(1, dto);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'hashed_password');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: 'new_hashed' }),
      );
    });

    it('should throw BadRequestException when current password is wrong', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(userStub());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.changePassword(1, { currentPassword: 'wrong', newPassword: 'newpass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changePassword(99, { currentPassword: 'x', newPassword: 'y' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
