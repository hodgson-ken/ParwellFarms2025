'use client';

import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function ShoppingBagSidebar() {
  const { cart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [itemsToShow, setItemsToShow] = useState<typeof cart>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevCartLengthRef = useRef(0);
  const isInitialMountRef = useRef(true);
  
  // Swipe/drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragCurrent, setDragCurrent] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);


  // Handle clicks outside the sidebar to dismiss it
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the sidebar
      const sidebar = document.querySelector('[data-sidebar="shopping-bag"]');
      if (sidebar && !sidebar.contains(target)) {
        setIsVisible(false);
        // Clear any pending auto-hide timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    // Add click listener after a small delay to avoid immediate dismissal
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible]);

  // Monitor cart changes and show sidebar
  useEffect(() => {
    const currentCartLength = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // On initial mount, just set the previous length - don't show sidebar
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevCartLengthRef.current = currentCartLength;
      return;
    }
    
    // Show sidebar when cart changes (items added/removed) and cart is not empty
    // Check if cart actually changed (not just initial load)
    const cartChanged = currentCartLength !== prevCartLengthRef.current;
    
    if (cartChanged && cart.length > 0) {
      // Update the previous length
      prevCartLengthRef.current = currentCartLength;
      
      // Update items to show (create new array to trigger re-render)
      setItemsToShow([...cart]);
      
      // Show sidebar
      setIsVisible(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide after 4 seconds (only if not being dragged)
      timeoutRef.current = setTimeout(() => {
        if (!isDragging) {
          setIsVisible(false);
        }
      }, 4000);
    } else if (cart.length === 0 && prevCartLengthRef.current > 0) {
      // Cart was cleared - hide sidebar
      prevCartLengthRef.current = 0;
      setIsVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cart, isDragging]);
  
  // Handle swipe/drag to open sidebar
  useEffect(() => {
    const sidebarWidth = 320; // w-80 = 320px
    
    const handleStart = (clientX: number) => {
      // Only allow dragging from the right edge of the screen (within 20px of right edge)
      // Or if sidebar is already visible, allow dragging from anywhere on it
      const isNearRightEdge = clientX >= window.innerWidth - 20;
      const sidebar = sidebarRef.current;
      const isOnSidebar = sidebar && sidebar.contains(document.elementFromPoint(clientX, window.innerHeight / 2) as Node);
      
      if (!isNearRightEdge && !isOnSidebar && !isVisible) return;
      
      setIsDragging(true);
      setDragStart(clientX);
      setDragCurrent(clientX);
      
      // Clear auto-hide timeout when user starts dragging
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Ensure sidebar is visible when dragging starts (if cart has items)
      if (!isVisible && cart.length > 0) {
        setIsVisible(true);
        setItemsToShow([...cart]);
      }
    };
    
    const handleMove = (clientX: number) => {
      if (!isDragging) return;
      
      const deltaX = clientX - dragStart;
      // Allow dragging to the left (negative deltaX) to open, or right (positive) to close
      setDragCurrent(clientX);
    };
    
    const handleEnd = () => {
      if (!isDragging) return;
      
      const deltaX = dragCurrent - dragStart;
      const threshold = sidebarWidth / 3; // Open if dragged more than 1/3 of the width
      
      if (isVisible) {
        // If sidebar is open, closing logic: if dragged right (positive deltaX) more than threshold, close it
        if (deltaX > threshold) {
          setIsVisible(false);
        } else {
          // Keep it open
          setIsVisible(true);
        }
      } else {
        // If sidebar is closed, opening logic: if dragged left (negative deltaX) more than threshold, open it
        if (deltaX < -threshold) {
          setIsVisible(true);
        } else {
          // Keep it closed
          setIsVisible(false);
        }
      }
      
      setIsDragging(false);
      setDragCurrent(0);
      setDragStart(0);
    };
    
    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      handleStart(e.touches[0].clientX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e.touches[0].clientX);
      }
    };
    
    const handleTouchEnd = () => {
      handleEnd();
    };
    
    // Mouse events for desktop
    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };
    
    const handleMouseUp = () => {
      handleEnd();
    };
    
    // Add touch listeners to document for dragging from anywhere
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    // Add mouse listeners
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, dragCurrent, isVisible, cart]);

  // Generate grid positions for items - 3 per row, stacked from bottom
  // SVG viewBox is 0 0 220 300, logo is at top (y=70), items can sit lower
  const getGridPosition = (index: number, total: number) => {
    // Bag opening area in SVG coordinates (updated for new bag size)
    const bagLeft = 45;   // Left edge of bag opening
    const bagRight = 175; // Right edge of bag opening
    const bagBottom = 230;  // Bottom of bag where items can stack up to
    
    const bagWidth = bagRight - bagLeft;
    
    // Grid layout: 3 products per row
    const productsPerRow = 3;
    const row = Math.floor(index / productsPerRow);
    const col = index % productsPerRow;
    
    // Calculate spacing - leave some padding
    const padding = 10;
    const availableWidth = bagWidth - (padding * 2);
    const itemWidth = availableWidth / productsPerRow;
    const itemHeight = itemWidth; // Keep items square
    
    // Calculate position - start from bottom, work up
    // X position: left to right within the row
    const x = bagLeft + padding + (col * itemWidth) + (itemWidth / 2);
    
    // Y position: start at bottom of bag and stack upward
    // Items start near the bottom and stack upward
    const yFromBottom = row * itemHeight;
    const y = bagBottom - padding - (yFromBottom + (itemHeight / 2));
    
    // Small random rotation for visual interest (optional)
    const rotation = (index % 7) * 3 - 9; // -9 to 9 degrees, subtle
    
    return {
      x: Math.max(bagLeft + 15, Math.min(bagRight - 15, x)), // Clamp to bag bounds
      y: Math.max(100, Math.min(bagBottom - 10, y)), // Clamp between below logo area and bag bottom
      rotation: rotation,
    };
  };

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300"
          onClick={() => setIsVisible(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        data-sidebar="shopping-bag"
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-[60] ${
          isDragging ? '' : 'transition-transform duration-300 ease-in-out'
        }`}
        style={{ 
          display: isVisible || itemsToShow.length > 0 || isDragging ? 'block' : 'none',
          transform: isDragging 
            ? (() => {
                // Calculate the transform based on drag position
                const deltaX = dragCurrent - dragStart;
                // Start from fully hidden (100%) if currently hidden, or from 0 if visible
                const startOffset = isVisible ? 0 : 320; // sidebarWidth
                const currentOffset = startOffset + deltaX;
                // Clamp between 0 (fully visible) and 320 (fully hidden)
                const clampedOffset = Math.max(0, Math.min(320, currentOffset));
                return `translateX(${clampedOffset}px)`;
              })()
            : isVisible 
              ? 'translateX(0)' 
              : 'translateX(100%)'
        }}
      >
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              Your Bag
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {itemsToShow.reduce((sum, item) => sum + (item.quantity || 1), 0)} item{itemsToShow.reduce((sum, item) => sum + (item.quantity || 1), 0) !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Shopping Bag with Items - Adjust position based on item count */}
          <div 
            className="flex items-center justify-center relative mb-4 flex-shrink-0"
            style={{
              minHeight: '180px',
              // Move bag higher as more items are added (dynamically adjust)
              marginTop: Math.max(0, -Math.floor(itemsToShow.reduce((sum, i) => sum + (i.quantity || 1), 0) / 3) * 10) + 'px',
            }}
          >
            {/* Paper Bag SVG - Clickable to go to cart */}
            <Link href="/cart" className="cursor-pointer block">
              <svg
                viewBox="0 0 220 300"
                className="w-full h-auto max-w-[220px] transition-transform hover:scale-105"
                preserveAspectRatio="xMidYMid meet"
              >
              <defs>
                {/* Clip path for bag opening - matches the bag interior shape exactly */}
                <clipPath id="bagOpening">
                  {/* Rectangular bag with flat bottom */}
                  <path d="M 45 50 L 175 50 L 175 240 L 45 240 Z" />
                </clipPath>
              </defs>

              {/* Draw bag first (background layer) */}
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
              {/* Bag width is roughly 130 units (from x=45 to x=175), 90% = 117 units */}
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
              <g clipPath="url(#bagOpening)">
                {itemsToShow.map((item, index) => {
                  const totalItems = itemsToShow.reduce((sum, i) => sum + (i.quantity || 1), 0);
                  
                  // Show multiple instances if quantity > 1
                  return Array.from({ length: item.quantity || 1 }).map((_, qtyIndex) => {
                    const itemIndex = itemsToShow.slice(0, index).reduce((sum, i) => sum + (i.quantity || 1), 0) + qtyIndex;
                    const position = getGridPosition(itemIndex, totalItems);
                    const size = 28; // Consistent size for grid layout
                    
                    return (
                      <g
                        key={`${item.variationId}-${qtyIndex}`}
                        transform={`translate(${position.x}, ${position.y}) rotate(${position.rotation})`}
                      >
                        {/* Product image or placeholder */}
                        {item.imageUrl ? (
                          <>
                            {/* White border/circle for image */}
                            <circle
                              cx="0"
                              cy="0"
                              r={size / 2 + 2}
                              fill="white"
                              opacity="0.95"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                            {/* Product image - clipped to bag opening */}
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
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  });
                })}
              </g>
            </svg>
            </Link>
          </div>

          {/* Item List - Show all items, no max height limit */}
          <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
            {itemsToShow.map((item) => (
              <div
                key={item.variationId}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.quantity || 1}x ${((item.price || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

