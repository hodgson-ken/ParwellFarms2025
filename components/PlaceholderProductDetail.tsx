'use client';

import { useEffect } from 'react';
import { formatPrice } from '@/lib/square';
import { PlaceholderProduct } from '@/data/placeholderProducts';
import AddToCartButton from './AddToCartButton';

interface PlaceholderProductDetailProps {
  product: PlaceholderProduct;
}

export default function PlaceholderProductDetail({ product }: PlaceholderProductDetailProps) {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Create a variation structure that matches what ProductDetailActions expects
  const variation = {
    id: `${product.id}-variation`,
    name: 'Default',
    price: { amount: product.price, currency: 'USD' },
    available: true,
  };

  return (
    <div className="py-12 px-4 bg-farm-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Placeholder Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-800 font-medium">
            <strong>⚠️ Placeholder Product:</strong> This is a sample product for development. 
            Real products will be loaded from Square once integration is configured.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <div className="text-3xl font-bold text-lavender-600 mb-6">
              {formatPrice({ amount: product.price, currency: 'USD' })}
            </div>

            {product.description && (
              <div className="mb-8">
                <h2 className="text-xl font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mb-8">
              <h2 className="text-xl font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-3">
                Add to Cart
              </h2>
              <AddToCartButton
                itemId={product.id}
                variationId={variation.id}
                name={product.name}
                price={variation.price}
                imageUrl={product.imageUrl}
              />
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-gray-600">
                This is a placeholder product. Tax and shipping will be calculated at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

