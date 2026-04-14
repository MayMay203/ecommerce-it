import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly roleRepository: RoleRepository) {}

  findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    this.logger.log(`Creating role: ${dto.name}`);

    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    return this.roleRepository.create({ name: dto.name });
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    this.logger.log(`Updating role #${id}`);

    await this.findOne(id);

    if (dto.name) {
      const existing = await this.roleRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role "${dto.name}" already exists`);
      }
    }

    const updated = await this.roleRepository.update(id, dto);
    return updated!;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting role #${id}`);
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }
}
