import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import { UserRepository } from '../repositories/user.repository';
import type { User } from '../entities/user.entity';

jest.mock('bcrypt');

const mockUserRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const users = [userStub(), userStub({ id: 2, email: 'jane@example.com' })];
      mockUserRepository.findAll.mockResolvedValue(users);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });

    it('should return an empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return user when found', async () => {
      // Arrange
      const user = userStub();
      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('User #99 not found');
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should hash password and create user', async () => {
      // Arrange
      const dto = {
        email: 'new@example.com',
        password: 'plaintext123',
        firstName: 'New',
        lastName: 'User',
        roleId: 2,
      };
      const created = userStub({ id: 3, email: 'new@example.com' });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new');
      mockUserRepository.create.mockResolvedValue(created);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com', password: 'hashed_new' }),
      );
      expect(result).toEqual(created);
    });

    it('should default isActive to true when not provided', async () => {
      // Arrange
      const dto = {
        email: 'new@example.com',
        password: 'plaintext123',
        firstName: 'New',
        lastName: 'User',
        roleId: 2,
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserRepository.create.mockResolvedValue(userStub());

      // Act
      await service.create(dto);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const dto = {
        email: 'john@example.com',
        password: 'plaintext123',
        firstName: 'John',
        lastName: 'Doe',
        roleId: 2,
      };
      mockUserRepository.findByEmail.mockResolvedValue(userStub());

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Email "john@example.com" already exists',
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update and return the user', async () => {
      // Arrange
      const dto = { firstName: 'Jane', isActive: false };
      const existing = userStub();
      const updated = userStub({ firstName: 'Jane', isActive: false });
      mockUserRepository.findById.mockResolvedValue(existing);
      mockUserRepository.update.mockResolvedValue(updated);

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ firstName: 'Jane', isActive: false }),
      );
      expect(result).toEqual(updated);
    });

    it('should hash new password when password is provided', async () => {
      // Arrange
      const dto = { password: 'newpassword' };
      mockUserRepository.findById.mockResolvedValue(userStub());
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');
      mockUserRepository.update.mockResolvedValue(userStub({ password: 'hashed_new_password' }));

      // Act
      await service.update(1, dto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: 'hashed_new_password' }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(99, { firstName: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should only update provided fields', async () => {
      // Arrange
      const dto = { roleId: 1 };
      mockUserRepository.findById.mockResolvedValue(userStub());
      mockUserRepository.update.mockResolvedValue(userStub({ roleId: 1 }));

      // Act
      await service.update(1, dto);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ roleId: 1 }),
      );
      // password should NOT be in update payload
      const updateCall = mockUserRepository.update.mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('password');
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should delete user successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(userStub());
      mockUserRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(1);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
