'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartPreview() {
  const { cart } = useCart();

  if (cart.length === 0) {
    return null;
  }

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Calculate grid positions for items - 3 per row, stacked from bottom
  // SVG viewBox is 0 0 220 300, logo is at top (y=70), items can sit lower
  const getGridPosition = (index: number, total: number) => {
    // Bag opening area in SVG coordinates (updated for new bag size)
    const bagLeft = 45;   // Left edge of bag opening
    const bagRight = 175; // Right edge of bag opening
    const bagBottom = 230;  // Bottom of bag where items can stack up to
    
    const bagWidth = bagRight - bagLeft;
    const padding = 10;
    const availableWidth = bagWidth - (padding * 2);
    const itemWidth = availableWidth / 3;
    const itemHeight = itemWidth;
    
    const productsPerRow = 3;
    const row = Math.floor(index / productsPerRow);
    const col = index % productsPerRow;
    
    const x = bagLeft + padding + (col * itemWidth) + (itemWidth / 2);
    const yFromBottom = row * itemHeight;
    const y = bagBottom - padding - (yFromBottom + (itemHeight / 2));
    
    const rotation = (index % 7) * 3 - 9;
    
    return {
      x: Math.max(bagLeft + 15, Math.min(bagRight - 15, x)),
      y: Math.max(100, Math.min(bagBottom - 10, y)), // Clamp between below logo area and bag bottom
      rotation: rotation,
    };
  };

  return (
    <Link 
      href="/cart"
      className="block bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-64 hover:shadow-3xl transition-shadow cursor-pointer"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Your Bag ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </h3>
      
      {/* Mini Bag Preview - Clickable */}
      <div className="mb-3">
        <svg
          viewBox="0 0 220 300"
          className="w-full h-auto max-w-[180px] mx-auto transition-transform hover:scale-105"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="previewBagOpening">
              {/* Rectangular bag with flat bottom */}
              <path d="M 45 50 L 175 50 L 175 240 L 45 240 Z" />
            </clipPath>
          </defs>

          {/* Bag shadow */}
          <ellipse
            cx="110"
            cy="255"
            rx="75"
            ry="15"
            fill="#000000"
            opacity="0.1"
          />

          {/* Bag body - rectangular grocery bag shape with flat bottom */}
          <path
            d="M 45 50 L 175 50 L 175 240 L 45 240 Z"
            fill="#8B7355"
            stroke="#6B5D47"
            strokeWidth="2"
          />

          {/* Bag handles - rounded handles that connect properly */}
          <path
            d="M 70 50 Q 70 30 90 25 Q 110 25 130 25 Q 150 30 150 50"
            fill="none"
            stroke="#6B5D47"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Logo printed on top of bag - appears as if branded/printed */}
          <g transform="translate(110, 70)">
            <image
              href="/logos/PWF WEB HEADER.webp"
              x="-58.5"
              y="-20"
              width="117"
              height="40"
              preserveAspectRatio="xMidYMid meet"
              opacity="0.6"
              style={{
                filter: 'sepia(30%) saturate(70%) brightness(0.9)',
              }}
            />
          </g>

          {/* Product images - clipped to bag opening, appear inside bag */}
          <g clipPath="url(#previewBagOpening)">
            {cart.flatMap((item, itemIndex) => 
              Array.from({ length: item.quantity || 1 }).map((_, qtyIndex) => {
                const index = cart.slice(0, itemIndex).reduce((sum, i) => sum + (i.quantity || 1), 0) + qtyIndex;
                const position = getGridPosition(index, totalItems);
                const size = 22;
                
                return (
                  <g
                    key={`${item.variationId}-${qtyIndex}`}
                    transform={`translate(${position.x}, ${position.y}) rotate(${position.rotation})`}
                  >
                    {item.imageUrl ? (
                      <>
                        <circle
                          cx="0"
                          cy="0"
                          r={size / 2 + 2}
                          fill="white"
                          opacity="0.95"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                        <image
                          href={item.imageUrl}
                          x={-size / 2}
                          y={-size / 2}
                          width={size}
                          height={size}
                          preserveAspectRatio="xMidYMid slice"
                          onError={(e) => {
                            // Fallback to placeholder circle - silently hide on error
                            const target = e.target as SVGImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </>
                    ) : (
                      <circle
                        cx="0"
                        cy="0"
                        r={size / 2}
                        fill="#f3f4f6"
                        stroke="#d1d5db"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })
            )}
          </g>
        </svg>
      </div>

      {/* Quick item list - show first 3 items */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {cart.slice(0, 3).map((item) => (
          <div key={item.variationId} className="flex items-center gap-2 text-xs">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-8 h-8 object-cover rounded"
              />
            )}
            <span className="text-gray-700 truncate flex-1">
              {item.name} {item.quantity > 1 && `×${item.quantity}`}
            </span>
          </div>
        ))}
        {cart.length > 3 && (
          <p className="text-xs text-gray-500 text-center pt-1">
            +{cart.length - 3} more
          </p>
        )}
      </div>
    </Link>
  );
}

