import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repo.findOneBy({ tokenHash });
  }

  create(data: Partial<RefreshToken>): Promise<RefreshToken> {
    const token = this.repo.create(data);
    return this.repo.save(token);
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.repo.update({ tokenHash }, { isRevoked: true });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.repo.update({ userId }, { isRevoked: true });
  }
}
