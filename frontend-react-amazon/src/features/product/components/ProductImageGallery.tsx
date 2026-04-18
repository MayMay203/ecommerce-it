import { useState } from 'react';
import type { ProductImage } from '../types/product.types';

interface Props {
  images: ProductImage[];
  thumbnailUrl: string | null;
  productName: string;
}

export function ProductImageGallery({ images, thumbnailUrl, productName }: Props) {
  const allImages = [
    ...(thumbnailUrl ? [{ id: 0, imageUrl: thumbnailUrl, sortOrder: -1, productId: 0 }] : []),
    ...images.sort((a, b) => a.sortOrder - b.sortOrder),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = allImages[selectedIndex];

  if (allImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50 border border-gray-200">
        <img
          src={current.imageUrl}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={img.id === 0 ? 'thumb' : img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 h-16 w-16 overflow-hidden rounded border-2 transition-colors ${
                idx === selectedIndex
                  ? 'border-blue-500'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img.imageUrl}
                alt={`${productName} ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
