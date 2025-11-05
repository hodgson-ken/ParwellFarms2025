'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { useSearch } from '@/contexts/SearchContext';

interface SquareProduct {
  id: string;
  updatedAt?: string;
  itemData?: {
    name?: string;
    categories?: Array<{ id?: string; name?: string }>;
  };
}

interface SquareProductsClientProps {
  items: SquareProduct[];
  categories: string[];
  categoryMap: Record<string, string>;
}

const PRODUCTS_PER_PAGE = 12;

export default function SquareProductsClient({ items, categories, categoryMap }: SquareProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { setProducts } = useSearch();

  // Update search context with products
  useEffect(() => {
    setProducts(items);
  }, [items, setProducts]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return items;
    }
    const filtered = items.filter((item) => {
      if (!item.itemData?.categories) return false;
      return item.itemData.categories.some((cat) => {
        // Get category name from map (by ID) or use name directly
        const categoryName = cat.id ? categoryMap[cat.id] : cat.name;
        const matches = categoryName?.toLowerCase() === selectedCategory.toLowerCase();
        return matches;
      });
    });
    return filtered;
  }, [items, selectedCategory, categoryMap]);

  // Reset display count when category changes
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, [selectedCategory]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const hasMore = displayCount < filteredItems.length;
    if (!hasMore) {
      // Clean up observer if all items are displayed
      if (loadMoreRef.current) {
        const observer = (loadMoreRef.current as any).__observer;
        if (observer) {
          observer.disconnect();
          (loadMoreRef.current as any).__observer = null;
        }
      }
      return;
    }

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredItems.length) {
          setDisplayCount((prev) => {
            const newCount = Math.min(prev + PRODUCTS_PER_PAGE, filteredItems.length);
            return newCount;
          });
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Trigger earlier to preload
      }
    );

    observer.observe(currentRef);
    (currentRef as any).__observer = observer; // Store reference for cleanup

    return () => {
      observer.disconnect();
      if (currentRef) {
        (currentRef as any).__observer = null;
      }
    };
  }, [displayCount, filteredItems.length]);

  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Categories Sidebar - Left Side */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="lg:bg-white lg:rounded-lg lg:border-2 lg:border-lavender-200 lg:shadow-sm lg:p-6 lg:sticky lg:top-4">
          {/* Mobile: Collapsible Categories Button with Breadcrumb */}
          <div className="lg:hidden mb-2">
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-lavender-50 border-2 border-lavender-200 hover:bg-lavender-100 hover:border-lavender-300 rounded-lg transition-colors shadow-sm"
            >
              <span className="text-lg font-[var(--font-libre-franklin)] font-semibold text-gray-900">
                {selectedCategory === 'All' ? (
                  'Categories'
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Categories</span>
                    <span className="text-gray-400">›</span>
                    <span>{selectedCategory}</span>
                  </span>
                )}
              </span>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Desktop: Always visible title */}
          <h2 className="hidden lg:block text-lg font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-4">
            Categories
          </h2>

          {/* Category List - Hidden on mobile when collapsed */}
          <nav className={`space-y-1 ${isCategoriesOpen ? 'block' : 'hidden'} lg:block`}>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setIsCategoriesOpen(false); // Close on mobile after selection
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-lavender-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-lavender-50 hover:text-lavender-700'
              }`}
            >
              All Products
            </button>
            {categories.sort().map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setIsCategoriesOpen(false); // Close on mobile after selection
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-lavender-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-lavender-50 hover:text-lavender-700'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area - Products */}
      <div className="flex-1 min-w-0">
        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid - Always at least 2 columns */}
        {displayedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
            
            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 text-center py-4">
                <p className="text-gray-500 text-sm">Loading more products...</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}


