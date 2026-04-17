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
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageService } from '../services/product-image.service';
import { ProductVariantService } from '../services/product-variant.service';
import { ProductService } from '../services/product.service';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantService: ProductVariantService,
    private readonly imageService: ProductImageService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Get()
  @Public()
  async findAll() {
    const data = await this.productService.findAll();
    return { data, message: 'Products retrieved successfully' };
  }

  @Get(':slug')
  @Public()
  async findOne(@Param('slug') slug: string) {
    const data = await this.productService.findBySlug(slug);
    return { data, message: 'Product retrieved successfully' };
  }

  @Get(':id/variants')
  @Public()
  async findVariants(@Param('id', ParseIntPipe) id: number) {
    const data = await this.variantService.findByProduct(id);
    return { data, message: 'Variants retrieved successfully' };
  }

  // ── Admin ────────────────────────────────────────────────────────────────────

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productService.create(dto);
    return { data, message: 'Product created successfully' };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    const data = await this.productService.update(id, dto);
    return { data, message: 'Product updated successfully' };
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productService.remove(id);
  }

  @Post(':id/variants')
  @Roles('admin')
  async addVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    const data = await this.variantService.create(id, dto);
    return { data, message: 'Variant created successfully' };
  }

  @Post(':id/images')
  @Roles('admin')
  async addImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductImageDto,
  ) {
    const data = await this.imageService.create(id, dto);
    return { data, message: 'Image added successfully' };
  }
}
