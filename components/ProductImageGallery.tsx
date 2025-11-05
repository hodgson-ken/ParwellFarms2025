'use client';

import { useState, useEffect } from 'react';
import ProductImage from './ProductImage';

interface ProductImageGalleryProps {
  imageIds: string[];
  productName: string;
}

export default function ProductImageGallery({ imageIds, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ensure imageIds is always an array
  const safeImageIds = Array.isArray(imageIds) ? imageIds : [];

  // Ensure selectedIndex is valid when imageIds change (only check when imageIds changes, not selectedIndex)
  useEffect(() => {
    if (safeImageIds && safeImageIds.length > 0) {
      if (selectedIndex >= safeImageIds.length || selectedIndex < 0) {
        setSelectedIndex(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeImageIds]); // Only depend on safeImageIds, not selectedIndex to avoid infinite loops

  // If no images, show placeholder
  if (!safeImageIds || safeImageIds.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <ProductImage
          src="/placeholder-product.jpg"
          alt={productName || 'Product'}
        />
      </div>
    );
  }

  // If only one image, show it simply
  if (safeImageIds.length === 1) {
    const imageId = safeImageIds[0];
    return (
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <ProductImage
          src={`/cached-images/${imageId}.jpg`}
          alt={productName || 'Product'}
          imageId={imageId}
        />
      </div>
    );
  }

  // Multiple images - show gallery with main image on top, thumbnails below
  // Ensure selectedIndex is within bounds
  const safeIndex = Math.min(selectedIndex, safeImageIds.length - 1);
  const selectedImageId = safeImageIds[safeIndex] || safeImageIds[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main large image on top */}
      <div className="w-full">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <ProductImage
            src={`/cached-images/${selectedImageId}.jpg`}
            alt={`${productName} - Image ${safeIndex + 1}`}
            imageId={selectedImageId}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Thumbnail gallery below main image */}
      <div className="flex flex-row gap-2 justify-center flex-wrap">
        {safeImageIds.map((imageId, index) => {
          if (!imageId) return null;
          return (
            <button
              key={imageId}
              type="button"
              onClick={() => {
                if (index >= 0 && index < safeImageIds.length) {
                  setSelectedIndex(index);
                }
              }}
              className={`w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg border-2 transition-all ${
                index === safeIndex
                  ? 'border-lavender-600 ring-2 ring-lavender-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`View image ${index + 1} of ${safeImageIds.length}`}
            >
              {/* Use simple img for thumbnails to reduce overhead */}
              <img
                src={`/cached-images/${imageId}.jpg`}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const currentSrc = target.src;
                  
                  // Fallback chain: cached -> API route -> placeholder
                  if (currentSrc.includes('/cached-images/') && imageId) {
                    // Try API route if cached image fails
                    target.src = `/api/square/image/${imageId}`;
                  } else if (currentSrc.includes('/api/square/image/')) {
                    // API route failed, use placeholder
                    target.src = '/placeholder-product.jpg';
                  } else if (!currentSrc.includes('placeholder-product.jpg')) {
                    // Any other error, use placeholder
                    target.src = '/placeholder-product.jpg';
                  }
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}


