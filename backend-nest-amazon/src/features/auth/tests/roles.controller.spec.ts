import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import type { Role } from '../entities/role.entity';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

const mockRolesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const roleStub = (overrides: Partial<Role> = {}): Role =>
  ({ id: 1, name: 'admin', users: [], ...overrides } as Role);

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockRolesService }],
    })
      // Skip guards — we test controller logic only, not auth
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RolesController>(RolesController);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return data and message', async () => {
      // Arrange
      const roles = [roleStub(), roleStub({ id: 2, name: 'customer' })];
      mockRolesService.findAll.mockResolvedValue(roles);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockRolesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: roles, message: 'Roles retrieved successfully' });
    });

    it('should return empty data array when no roles exist', async () => {
      mockRolesService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual({ data: [], message: 'Roles retrieved successfully' });
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return data and message for existing role', async () => {
      // Arrange
      const role = roleStub();
      mockRolesService.findOne.mockResolvedValue(role);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(mockRolesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ data: role, message: 'Role retrieved successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      // Arrange
      mockRolesService.findOne.mockRejectedValue(new NotFoundException('Role #99 not found'));

      // Act & Assert
      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should return data and message with created role', async () => {
      // Arrange
      const dto = { name: 'moderator' };
      const created = roleStub({ id: 3, name: 'moderator' });
      mockRolesService.create.mockResolvedValue(created);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ data: created, message: 'Role created successfully' });
    });

    it('should propagate ConflictException from service', async () => {
      // Arrange
      mockRolesService.create.mockRejectedValue(
        new ConflictException('Role "admin" already exists'),
      );

      // Act & Assert
      await expect(controller.create({ name: 'admin' })).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should return data and message with updated role', async () => {
      // Arrange
      const dto = { name: 'super-admin' };
      const updated = roleStub({ name: 'super-admin' });
      mockRolesService.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update(1, dto);

      // Assert
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ data: updated, message: 'Role updated successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      mockRolesService.update.mockRejectedValue(new NotFoundException('Role #99 not found'));
      await expect(controller.update(99, { name: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('should propagate ConflictException from service', async () => {
      mockRolesService.update.mockRejectedValue(
        new ConflictException('Role "customer" already exists'),
      );
      await expect(controller.update(1, { name: 'customer' })).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should call service.remove and return void', async () => {
      // Arrange
      mockRolesService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(mockRolesService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should propagate NotFoundException from service', async () => {
      mockRolesService.remove.mockRejectedValue(new NotFoundException('Role #99 not found'));
      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
