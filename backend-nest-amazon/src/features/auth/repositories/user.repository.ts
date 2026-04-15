import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find({
      relations: ['role'],
      order: { id: 'ASC' },
    });
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['role'] });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  findByEmailWithRole(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email }, relations: ['role'] });
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const { role: _role, ...updateData } = data;
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
