'use client';

import Link from 'next/link';
import { formatPrice, getItemVariations } from '@/lib/square';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  item: any;
}

export default function ProductCard({ item }: ProductCardProps) {
  const [outOfStock, setOutOfStock] = useState<boolean | null>(null);
  const variations = getItemVariations(item);
  const firstVariation = variations[0];
  const price = firstVariation?.price;
  const imageId = item.itemData?.imageIds?.[0];
  
  // Check stock status - use useMemo to prevent dependency changes from re-triggering
  useEffect(() => {
    // Only check if variations track inventory
    const trackingVariations = variations.filter((v: any) => v.trackInventory);
    if (trackingVariations.length === 0) {
      setOutOfStock(false); // Not tracking inventory = assume in stock
      return;
    }

    // Don't re-check if we already have a result (prevent flashing)
    if (outOfStock !== null) {
      return;
    }

    // Check stock via API with a small delay to avoid rate limiting
    // Stagger requests by item index to prevent all products from requesting at once
    const delay = Math.random() * 100; // Random 0-100ms delay
    
    setTimeout(() => {
      fetch(`/api/square/check-stock?itemId=${item.id}`)
        .then(res => {
          if (res.status === 429) {
            // Rate limited - use cached or default value
            console.warn(`[ProductCard] Rate limited for ${item.itemData?.name || item.id}, defaulting to in stock`);
            return res.json().then(data => ({ ...data, rateLimited: true }));
          }
          return res.json();
        })
        .then(data => {
          const isOutOfStock = data.outOfStock || false;
          setOutOfStock(isOutOfStock);
          if (isOutOfStock) {
            console.log(`[ProductCard] Product out of stock: ${item.itemData?.name || item.id}`, {
              itemId: item.id,
              itemName: item.itemData?.name,
              outOfStock: isOutOfStock,
              cached: data.cached,
            });
          }
          if (data.rateLimited) {
            console.warn(`[ProductCard] Rate limited - stock status may be stale for ${item.itemData?.name || item.id}`);
          }
        })
        .catch(err => {
          console.error(`[ProductCard] Error checking stock for ${item.itemData?.name || item.id}:`, err);
          setOutOfStock(false); // Default to in stock on error
        });
    }, delay);
  }, [item.id]); // Only depend on item.id to prevent re-checks
  
  // Try cached image first (served as static file), then API route (for uncached images)
  const getImageUrl = () => {
    if (!imageId) return '/placeholder-product.jpg';
    // Prioritize cached images - these are faster and don't hit API rate limits
    // Next.js will serve files from /public/cached-images/ as static assets
    return `/cached-images/${imageId}.jpg`;
  };

  return (
    <Link href={`/products/${item.id}`} className="card group flex flex-col h-full">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={getImageUrl()}
          alt={item.itemData?.name || 'Product'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // Fallback chain: cached image -> API route -> placeholder
            const target = e.target as HTMLImageElement;
            const currentSrc = target.src;
            
            if (currentSrc.includes('/cached-images/') && imageId) {
              // Cached image failed - might not exist yet or file issue
              console.warn(`[ProductCard] Cached image not found for ${item.itemData?.name || item.id}:`, {
                itemId: item.id,
                itemName: item.itemData?.name,
                imageId: imageId,
                attemptedUrl: currentSrc,
                note: 'Cached image missing, falling back to API route (will cache for future)',
                timestamp: new Date().toISOString(),
              });
              // Try API route (will fetch and cache for future requests)
              target.src = `/api/square/image/${imageId}`;
            } else if (currentSrc.includes('/api/square/image/')) {
              // API route failed, use placeholder
              console.error(`[ProductCard] API route also failed for ${item.itemData?.name || item.id}:`, {
                itemId: item.id,
                imageId: imageId,
                note: 'Both cached and API routes failed, using placeholder',
                timestamp: new Date().toISOString(),
              });
              target.src = '/placeholder-product.jpg';
            } else if (!currentSrc.includes('placeholder-product.jpg')) {
              // Any other error, use placeholder
              console.error(`[ProductCard] Unexpected image error for ${item.itemData?.name || item.id}:`, {
                itemId: item.id,
                imageId: imageId,
                attemptedUrl: currentSrc,
                timestamp: new Date().toISOString(),
              });
              target.src = '/placeholder-product.jpg';
            }
          }}
          onLoad={(e) => {
            // Image loaded successfully
            const target = e.target as HTMLImageElement;
            target.style.opacity = '1';
            // Silent success - cached images load fast without logging
          }}
        />
      </div>
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
        <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-farm-green mb-2 sm:mb-3 md:mb-4 group-hover:text-lavender-600 transition-colors">
          {item.itemData?.name || 'Product'}
        </h3>
        <div className="flex flex-col gap-1 sm:gap-2 mt-auto">
          {outOfStock && (
            <span className="text-xs sm:text-sm font-semibold text-red-600">
              Out of stock
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-farm-green">
              {formatPrice(price)}
            </span>
            {variations.length > 1 && (
              <span className="text-xs sm:text-sm text-gray-500">
                {variations.length} variants
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

