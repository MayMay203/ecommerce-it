import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import type { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const userStub = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'john@example.com',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    phone: null,
    isActive: true,
    roleId: 2,
    role: { id: 2, name: 'customer', users: [] },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as User);

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      // Skip guards — we test controller logic only, not auth
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return data and message', async () => {
      // Arrange
      const users = [userStub(), userStub({ id: 2, email: 'jane@example.com' })];
      mockUsersService.findAll.mockResolvedValue(users);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: users, message: 'Users retrieved successfully' });
    });

    it('should return empty data array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual({ data: [], message: 'Users retrieved successfully' });
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return data and message for existing user', async () => {
      // Arrange
      const user = userStub();
      mockUsersService.findOne.mockResolvedValue(user);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ data: user, message: 'User retrieved successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      // Arrange
      mockUsersService.findOne.mockRejectedValue(new NotFoundException('User #99 not found'));

      // Act & Assert
      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should return data and message with created user', async () => {
      // Arrange
      const dto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        roleId: 2,
      };
      const created = userStub({ id: 3, email: 'new@example.com' });
      mockUsersService.create.mockResolvedValue(created);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ data: created, message: 'User created successfully' });
    });

    it('should propagate ConflictException from service', async () => {
      // Arrange
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email "john@example.com" already exists'),
      );

      // Act & Assert
      await expect(
        controller.create({
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          roleId: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should return data and message with updated user', async () => {
      // Arrange
      const dto = { firstName: 'Jane', isActive: false };
      const updated = userStub({ firstName: 'Jane', isActive: false });
      mockUsersService.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update(1, dto);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ data: updated, message: 'User updated successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      mockUsersService.update.mockRejectedValue(new NotFoundException('User #99 not found'));
      await expect(controller.update(99, { firstName: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should propagate ConflictException from service', async () => {
      mockUsersService.update.mockRejectedValue(
        new ConflictException('Email already exists'),
      );
      await expect(controller.update(1, { roleId: 1 })).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should call service.remove and return void', async () => {
      // Arrange
      mockUsersService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should propagate NotFoundException from service', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException('User #99 not found'));
      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
