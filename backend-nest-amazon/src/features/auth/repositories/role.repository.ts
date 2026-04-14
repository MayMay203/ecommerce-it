import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  findById(id: number): Promise<Role | null> {
    return this.repo.findOneBy({ id });
  }

  findByName(name: string): Promise<Role | null> {
    return this.repo.findOneBy({ name });
  }

  create(data: Partial<Role>): Promise<Role> {
    const role = this.repo.create(data);
    return this.repo.save(role);
  }

  async update(id: number, data: Partial<Role>): Promise<Role | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
