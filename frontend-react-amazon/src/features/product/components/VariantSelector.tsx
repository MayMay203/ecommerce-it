import type { ProductVariant } from '../types/product.types';

interface Props {
  variants: ProductVariant[];
  selectedId: number | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedId, onSelect }: Props) {
  if (variants.length === 0) return null;

  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];

  const selectedVariant = variants.find((v) => v.id === selectedId) ?? null;

  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;

  function selectByColorSize(color: string | null, size: string | null) {
    const match = variants.find(
      (v) => (color === null || v.color === color) && (size === null || v.size === size),
    );
    if (match) onSelect(match);
  }

  return (
    <div className="flex flex-col gap-4">
      {hasColors && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Color{selectedVariant?.color ? `: ${selectedVariant.color}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedVariant?.color === color;
              const variantsOfColor = variants.filter((v) => v.color === color);
              const outOfStock = variantsOfColor.every((v) => v.stockQuantity === 0);
              return (
                <button
                  key={color}
                  onClick={() => selectByColorSize(color, selectedVariant?.size ?? null)}
                  disabled={outOfStock}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  } ${outOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Size{selectedVariant?.size ? `: ${selectedVariant.size}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size;
              const variantsOfSize = variants.filter((v) => v.size === size);
              const outOfStock = variantsOfSize.every((v) => v.stockQuantity === 0);
              return (
                <button
                  key={size}
                  onClick={() => selectByColorSize(selectedVariant?.color ?? null, size)}
                  disabled={outOfStock}
                  className={`rounded border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  } ${outOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* If variants have no color/size grouping — just list them */}
      {!hasColors && !hasSizes && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Option</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedId;
              const outOfStock = v.stockQuantity === 0;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelect(v)}
                  disabled={outOfStock}
                  className={`rounded border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  } ${outOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                >
                  {v.sku}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedVariant && (
        <p className="text-xs text-gray-500">
          {selectedVariant.stockQuantity > 0
            ? `${selectedVariant.stockQuantity} in stock`
            : 'Out of stock'}
        </p>
      )}
    </div>
  );
}
