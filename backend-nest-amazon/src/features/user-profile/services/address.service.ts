import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { Address } from '../entities/address.entity';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  async getAllAddresses(userId: number): Promise<Address[]> {
    this.logger.log(`Getting all addresses for user #${userId}`);
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAddressById(id: number, userId: number): Promise<Address> {
    const address = await this.repo.findOneBy({ id, userId });
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }
    return address;
  }

  async createAddress(userId: number, dto: CreateAddressDto): Promise<Address> {
    this.logger.log(`Creating address for user #${userId}`);

    const isDefault = await this.shouldBeDefault(userId);

    const address = this.repo.create({
      userId,
      ...dto,
      isDefault,
    });
    return this.repo.save(address);
  }

  async updateAddress(id: number, userId: number, dto: UpdateAddressDto): Promise<Address> {
    this.logger.log(`Updating address #${id} for user #${userId}`);

    const address = await this.getAddressById(id, userId);
    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async deleteAddress(id: number, userId: number): Promise<void> {
    this.logger.log(`Deleting address #${id} for user #${userId}`);

    const address = await this.getAddressById(id, userId);

    if (address.isDefault) {
      const addresses = await this.repo.find({ where: { userId } });
      const nextDefault = addresses.find((a) => a.id !== id);
      if (nextDefault) {
        nextDefault.isDefault = true;
        await this.repo.save(nextDefault);
      }
    }

    await this.repo.remove(address);
  }

  async setDefaultAddress(id: number, userId: number): Promise<Address> {
    this.logger.log(`Setting address #${id} as default for user #${userId}`);

    const address = await this.getAddressById(id, userId);

    await this.repo.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.repo.save(address);
  }

  private async shouldBeDefault(userId: number): Promise<boolean> {
    const count = await this.repo.countBy({ userId });
    return count === 0;
  }
}
