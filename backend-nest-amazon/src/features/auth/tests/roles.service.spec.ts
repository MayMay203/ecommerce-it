import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { RoleRepository } from '../repositories/role.repository';
import type { Role } from '../entities/role.entity';

const mockRoleRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const roleStub = (overrides: Partial<Role> = {}): Role =>
  ({ id: 1, name: 'admin', users: [], ...overrides } as Role);

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return all roles', async () => {
      // Arrange
      const roles = [roleStub(), roleStub({ id: 2, name: 'customer' })];
      mockRoleRepository.findAll.mockResolvedValue(roles);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(roles);
    });

    it('should return an empty array when no roles exist', async () => {
      mockRoleRepository.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return role when found', async () => {
      // Arrange
      const role = roleStub();
      mockRoleRepository.findById.mockResolvedValue(role);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException when role does not exist', async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Role #99 not found');
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create and return a new role', async () => {
      // Arrange
      const dto = { name: 'moderator' };
      const created = roleStub({ id: 3, name: 'moderator' });
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockResolvedValue(created);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('moderator');
      expect(mockRoleRepository.create).toHaveBeenCalledWith({ name: 'moderator' });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when name already exists', async () => {
      // Arrange
      const dto = { name: 'admin' };
      mockRoleRepository.findByName.mockResolvedValue(roleStub());

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow('Role "admin" already exists');
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update and return the role', async () => {
      // Arrange
      const dto = { name: 'super-admin' };
      const existing = roleStub();
      const updated = roleStub({ name: 'super-admin' });
      mockRoleRepository.findById.mockResolvedValue(existing);
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.update.mockResolvedValue(updated);

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRoleRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when role does not exist', async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(99, { name: 'x' })).rejects.toThrow(NotFoundException);
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name belongs to another role', async () => {
      // Arrange
      const dto = { name: 'customer' };
      mockRoleRepository.findById.mockResolvedValue(roleStub({ id: 1 }));
      // name "customer" belongs to role id=2
      mockRoleRepository.findByName.mockResolvedValue(roleStub({ id: 2, name: 'customer' }));

      // Act & Assert
      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
      await expect(service.update(1, dto)).rejects.toThrow('Role "customer" already exists');
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating with the same name (self-collision is no-op)', async () => {
      // Arrange — findByName returns the same role being updated
      const dto = { name: 'admin' };
      const role = roleStub({ id: 1, name: 'admin' });
      mockRoleRepository.findById.mockResolvedValue(role);
      mockRoleRepository.findByName.mockResolvedValue(role); // same id → allowed
      mockRoleRepository.update.mockResolvedValue(role);

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(mockRoleRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(role);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should delete role successfully', async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(roleStub());
      mockRoleRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(1);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when role does not exist', async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });
  });
});
