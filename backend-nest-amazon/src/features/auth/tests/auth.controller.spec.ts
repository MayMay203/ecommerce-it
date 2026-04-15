import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import type { User } from '../entities/user.entity';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
  updateMe: jest.fn(),
  changePassword: jest.fn(),
};

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const userStub = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'alice@example.com',
    password: 'hashed',
    firstName: 'Alice',
    lastName: 'Smith',
    phone: null,
    isActive: true,
    roleId: 2,
    role: { id: 2, name: 'customer', users: [] },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as User);

const mockRequest = (cookieHeader = ''): Partial<Request> => ({
  headers: { cookie: cookieHeader, 'user-agent': 'jest' },
  socket: { remoteAddress: '127.0.0.1' } as any,
});

const mockResponse = (): Partial<Response> => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
});

// ---------------------------------------------------------------------------

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
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

    it('should return user data and success message', async () => {
      // Arrange
      const user = userStub({ id: 2, email: 'new@example.com' });
      mockAuthService.register.mockResolvedValue(user);

      // Act
      const result = await controller.register(dto);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result.data).toMatchObject({ id: 2, email: 'new@example.com', role: 'customer' });
      expect(result.message).toBe('Registration successful');
    });

    it('should propagate ConflictException from service', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(new ConflictException('AUTH_005'));

      // Act & Assert
      await expect(controller.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('login', () => {
    const dto = { email: 'alice@example.com', password: 'password123' };

    it('should set refresh_token cookie and return accessToken + user', async () => {
      // Arrange
      const user = userStub();
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      mockAuthService.login.mockResolvedValue({
        accessToken: 'jwt_token',
        rawRefreshToken: 'raw_refresh',
        user,
      });

      // Act
      const result = await controller.login(dto, req, res);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(dto, expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'raw_refresh',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.data.accessToken).toBe('jwt_token');
      expect(result.data.user.email).toBe('alice@example.com');
    });

    it('should propagate UnauthorizedException from service', async () => {
      // Arrange
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('AUTH_001'));

      // Act & Assert
      await expect(controller.login(dto, req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('refresh', () => {
    it('should return new accessToken when cookie is present', async () => {
      // Arrange
      const req = mockRequest('refresh_token=raw123') as Request;
      mockAuthService.refresh.mockResolvedValue({ accessToken: 'new_token' });

      // Act
      const result = await controller.refresh(req);

      // Assert
      expect(mockAuthService.refresh).toHaveBeenCalledWith('raw123');
      expect(result.data.accessToken).toBe('new_token');
    });

    it('should return null accessToken when no cookie', async () => {
      // Arrange
      const req = mockRequest('') as Request;

      // Act
      const result = await controller.refresh(req);

      // Assert
      expect(mockAuthService.refresh).not.toHaveBeenCalled();
      expect(result.data.accessToken).toBeNull();
    });

    it('should propagate UnauthorizedException when token is invalid', async () => {
      // Arrange
      const req = mockRequest('refresh_token=bad_token') as Request;
      mockAuthService.refresh.mockRejectedValue(new UnauthorizedException('AUTH_002'));

      // Act & Assert
      await expect(controller.refresh(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('logout', () => {
    it('should revoke token and clear cookie', async () => {
      // Arrange
      const req = mockRequest('refresh_token=raw123') as Request;
      const res = mockResponse() as Response;
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      const result = await controller.logout(req, res);

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith('raw123');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result.message).toBe('Logged out successfully');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getMe', () => {
    it('should return current user data', async () => {
      // Arrange
      const user = userStub();
      const payload = { sub: 1, email: 'alice@example.com', role: 'customer' };
      mockAuthService.getMe.mockResolvedValue(user);

      // Act
      const result = await controller.getMe(payload);

      // Assert
      expect(mockAuthService.getMe).toHaveBeenCalledWith(1);
      expect(result.data).toEqual(user);
    });

    it('should propagate NotFoundException', async () => {
      // Arrange
      mockAuthService.getMe.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(controller.getMe({ sub: 99, email: 'x@x.com', role: 'customer' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('updateMe', () => {
    it('should return updated user data', async () => {
      // Arrange
      const dto = { firstName: 'Updated' };
      const updated = userStub({ firstName: 'Updated' });
      const payload = { sub: 1, email: 'alice@example.com', role: 'customer' };
      mockAuthService.updateMe.mockResolvedValue(updated);

      // Act
      const result = await controller.updateMe(payload, dto);

      // Assert
      expect(mockAuthService.updateMe).toHaveBeenCalledWith(1, dto);
      expect(result.data.firstName).toBe('Updated');
    });
  });

  // ---------------------------------------------------------------------------
  describe('changePassword', () => {
    it('should return success message', async () => {
      // Arrange
      const dto = { currentPassword: 'old', newPassword: 'new123' };
      const payload = { sub: 1, email: 'alice@example.com', role: 'customer' };
      mockAuthService.changePassword.mockResolvedValue(undefined);

      // Act
      const result = await controller.changePassword(payload, dto);

      // Assert
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, dto);
      expect(result.message).toBe('Password changed successfully');
    });

    it('should propagate BadRequestException when current password is wrong', async () => {
      // Arrange
      const payload = { sub: 1, email: 'alice@example.com', role: 'customer' };
      mockAuthService.changePassword.mockRejectedValue(
        new BadRequestException('Current password is incorrect'),
      );

      // Act & Assert
      await expect(
        controller.changePassword(payload, { currentPassword: 'wrong', newPassword: 'new123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
