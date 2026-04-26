import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IUserPayload } from '../../../shared/decorators/current-user.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressService } from '../services/address.service';

@ApiTags('addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  async getAllAddresses(@CurrentUser() user: IUserPayload) {
    const data = await this.addressService.getAllAddresses(user.sub);
    return { data, message: 'Addresses retrieved successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  async getAddressById(@Param('id') id: string, @CurrentUser() user: IUserPayload) {
    const data = await this.addressService.getAddressById(Number(id), user.sub);
    return { data, message: 'Address retrieved successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new address' })
  async createAddress(@CurrentUser() user: IUserPayload, @Body() dto: CreateAddressDto) {
    const data = await this.addressService.createAddress(user.sub, dto);
    return { data, message: 'Address created successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  async updateAddress(
    @Param('id') id: string,
    @CurrentUser() user: IUserPayload,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressService.updateAddress(Number(id), user.sub, dto);
    return { data, message: 'Address updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an address' })
  async deleteAddress(@Param('id') id: string, @CurrentUser() user: IUserPayload) {
    await this.addressService.deleteAddress(Number(id), user.sub);
    return { message: 'Address deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefaultAddress(@Param('id') id: string, @CurrentUser() user: IUserPayload) {
    const data = await this.addressService.setDefaultAddress(Number(id), user.sub);
    return { data, message: 'Default address updated successfully' };
  }
}
