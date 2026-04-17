import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { ProductImage } from '../entities/product-image.entity';
import { ProductImageRepository } from '../repositories/product-image.repository';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger(ProductImageService.name);

  constructor(
    private readonly imageRepository: ProductImageRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(productId: number, dto: CreateProductImageDto): Promise<ProductImage> {
    this.logger.log(`Adding image to product #${productId}`);

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    return this.imageRepository.create({
      productId,
      imageUrl: dto.imageUrl,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting image #${id}`);

    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException(`Image #${id} not found`);
    }

    await this.imageRepository.delete(id);
  }
}
