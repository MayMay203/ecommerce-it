export { ProductCard } from './components/ProductCard';
export { ProductFilters } from './components/ProductFilters';
export { ProductGrid } from './components/ProductGrid';
export { VariantSelector } from './components/VariantSelector';
export { ProductImageGallery } from './components/ProductImageGallery';
export { useProducts } from './hooks/useProducts';
export { useProductDetail } from './hooks/useProductDetail';
export { productService } from './services/product.service';
export { formatPrice, getDisplayPrice, getEffectivePrice } from './utils/product.utils';
export type {
  Product,
  ProductVariant,
  ProductImage,
  ProductFilters as ProductFiltersType,
  Category,
} from './types/product.types';
