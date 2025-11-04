'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/square';
import AddToCartButton from './AddToCartButton';
import SquareCheckout from './SquareCheckout';

interface Variation {
  id: string;
  name: string;
  price: { amount: number; currency: string } | null;
  sku?: string;
  available: boolean;
}

interface ProductDetailActionsProps {
  itemId: string;
  itemName: string;
  variations: Variation[];
  item: any;
  imageUrl: string;
}

export default function ProductDetailActions({
  itemId,
  itemName,
  variations,
  item,
  imageUrl,
}: ProductDetailActionsProps) {
  const [selectedVariationId, setSelectedVariationId] = useState(variations[0]?.id || '');
  const [outOfStock, setOutOfStock] = useState<boolean | null>(null);

  const selectedVariation = variations.find(v => v.id === selectedVariationId) || variations[0];

  // Check stock status - prevent re-checks to avoid flashing
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

    // Check stock via API
    fetch(`/api/square/check-stock?itemId=${itemId}`)
      .then(res => res.json())
      .then(data => {
        const isOutOfStock = data.outOfStock || false;
        setOutOfStock(isOutOfStock);
        if (isOutOfStock) {
          console.log(`[ProductDetailActions] Product out of stock: ${itemName}`, {
            itemId: itemId,
            itemName: itemName,
            outOfStock: isOutOfStock,
          });
        }
      })
      .catch(err => {
        console.error(`[ProductDetailActions] Error checking stock for ${itemName}:`, err);
        setOutOfStock(false); // Default to in stock on error
      });
  }, [itemId]); // Only depend on itemId to prevent re-checks

  if (variations.length === 0) {
    return <p className="text-gray-600">This product is currently unavailable.</p>;
  }

  return (
    <>
      {variations.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Option
          </label>
          <select
            value={selectedVariationId}
            onChange={(e) => setSelectedVariationId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>
                {variation.name} - {variation.price ? formatPrice(variation.price) : 'Price not available'}
              </option>
            ))}
          </select>
        </div>
      )}

      {outOfStock ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold text-red-600 mb-2">Out of Stock</p>
          <p className="text-sm text-gray-600">This item is currently unavailable for purchase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add to Cart Button */}
          {selectedVariation && selectedVariation.price && (
            <AddToCartButton
              itemId={itemId}
              variationId={selectedVariation.id}
              name={`${itemName}${variations.length > 1 ? ` - ${selectedVariation.name}` : ''}`}
              price={selectedVariation.price}
              imageUrl={imageUrl}
              disabled={outOfStock === true}
            />
          )}

          {/* Direct Checkout Option */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-4 text-center">Or checkout directly:</p>
            <SquareCheckout 
              item={item} 
              variations={variations}
              disabled={outOfStock === true}
            />
          </div>
        </div>
      )}
    </>
  );
}

