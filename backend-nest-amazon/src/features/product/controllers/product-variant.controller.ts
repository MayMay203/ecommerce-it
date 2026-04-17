import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductVariantService } from '../services/product-variant.service';

@Controller('variants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductVariantController {
  constructor(private readonly variantService: ProductVariantService) {}

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.variantService.findOne(id);
    return { data, message: 'Variant retrieved successfully' };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductVariantDto,
  ) {
    const data = await this.variantService.update(id, dto);
    return { data, message: 'Variant updated successfully' };
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.variantService.remove(id);
  }
}
