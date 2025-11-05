'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Array<{
    id: string;
    itemData?: {
      name?: string;
      imageIds?: string[];
    };
  }>;
}

export default function SearchModal({ isOpen, onClose, products }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<typeof products>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter((item) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      return name.includes(query);
    });

    setResults(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchQuery, products]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleResultClick = (productId: string) => {
    onClose();
    router.push(`/products/${productId}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium px-2"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[60vh]">
          {searchQuery.trim() && results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No products found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((item) => {
                // Handle both Square products (with imageIds) and placeholder products (with imageUrl)
                const imageId = item.itemData?.imageIds?.[0];
                let imageUrl = '/placeholder-product.jpg';
                
                if (imageId) {
                  // Check if it's a full URL (placeholder product) or just an ID (Square product)
                  if (imageId.startsWith('http') || imageId.startsWith('/')) {
                    imageUrl = imageId;
                  } else {
                    imageUrl = `/cached-images/${imageId}.jpg`;
                  }
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item.id)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center gap-4"
                  >
                    <img
                      src={imageUrl}
                      alt={item.itemData?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.itemData?.name || 'Unnamed Product'}
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Start typing to search for products...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

