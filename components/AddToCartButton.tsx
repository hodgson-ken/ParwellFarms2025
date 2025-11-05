'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/square';

interface AddToCartButtonProps {
  itemId: string;
  variationId: string;
  name: string;
  price: { amount: number; currency: string };
  imageUrl?: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  itemId,
  variationId,
  name,
  price,
  imageUrl,
  disabled = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (disabled) {
      return;
    }
    
    addToCart({
      itemId,
      variationId,
      name,
      price: price.amount,
      quantity,
      imageUrl,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-50 transition-colors"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className="w-full btn-primary relative disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showSuccess ? (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart!
          </span>
        ) : (
          `Add to Cart - ${formatPrice({ amount: price.amount * quantity, currency: price.currency })}`
        )}
      </button>
    </div>
  );
}

