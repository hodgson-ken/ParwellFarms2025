'use client';

import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  imageId?: string; // Optional: for fallback chain
}

export default function ProductImage({ src, alt, className = 'w-full h-full object-cover', imageId }: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  const handleError = () => {
    const currentSrc = imageSrc;
    
    // Fallback chain: cached image -> API route -> placeholder
    if (currentSrc.includes('/cached-images/') && imageId) {
      // Cached image failed - might not exist yet, try API route (will fetch and cache)
      console.warn(`[ProductImage] Cached image not found, falling back to API: ${imageId}`);
      setImageSrc(`/api/square/image/${imageId}`);
    } else if (currentSrc.includes('/api/square/image/')) {
      // API route failed, use placeholder
      console.error(`[ProductImage] API route also failed for image: ${imageId}, using placeholder`);
      setImageSrc('/placeholder-product.jpg');
    } else if (!currentSrc.includes('placeholder-product.jpg')) {
      // Any other error, use placeholder
      console.error(`[ProductImage] Unexpected image error, using placeholder`);
      setImageSrc('/placeholder-product.jpg');
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}

