import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly userRepository: UserRepository) {}

  findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${dto.email}`);

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.userRepository.create({
      email: dto.email,
      password: passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      isActive: dto.isActive ?? true,
      roleId: dto.roleId,
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user #${id}`);

    await this.findOne(id);

    const updateData: Partial<User> = {};

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone ?? null;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;

    const updated = await this.userRepository.update(id, updateData);
    return updated!;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting user #${id}`);
    await this.findOne(id);
    await this.userRepository.delete(id);
  }
}
