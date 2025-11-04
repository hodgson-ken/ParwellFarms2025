'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/square';

interface PlaceholderProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
  };
}

export default function PlaceholderProductCard({ product }: PlaceholderProductCardProps) {
  return (
    <div className="card group relative flex flex-col h-full">
      {/* Placeholder Badge */}
      <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
        PLACEHOLDER
      </div>
      
      <Link href={`/products/${product.id}`} className="flex flex-col flex-1">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
            }}
          />
        </div>
        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
          <h3 className="text-base sm:text-lg md:text-xl font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4 group-hover:text-lavender-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {formatPrice({ amount: product.price, currency: 'USD' })}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

