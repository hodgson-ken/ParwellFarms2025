'use client';

import { useState, useEffect } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  imageId?: string; // Optional: for fallback chain
}

export default function ProductImage({ src, alt, className = 'w-full h-full object-cover', imageId }: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  // Update imageSrc when src prop changes (e.g., when user clicks a different thumbnail)
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleError = () => {
    const currentSrc = imageSrc;
    
    // Fallback chain: cached image -> API route -> placeholder
    if (currentSrc.includes('/cached-images/') && imageId) {
      // Cached image failed - try API route (will fetch and cache)
      setImageSrc(`/api/square/image/${imageId}`);
    } else if (currentSrc.includes('/api/square/image/')) {
      // API route failed, use placeholder
      setImageSrc('/placeholder-product.jpg');
    } else if (!currentSrc.includes('placeholder-product.jpg')) {
      // Any other error, use placeholder
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

