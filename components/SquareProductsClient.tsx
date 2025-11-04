'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return items;
    }
    return items.filter((item) => {
      if (!item.itemData?.categories) return false;
      return item.itemData.categories.some((cat) => {
        // Get category name from map (by ID) or use name directly
        const categoryName = cat.id ? categoryMap[cat.id] : cat.name;
        return categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      });
    });
  }, [items, selectedCategory, categoryMap]);

  // Reset display count when category changes
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE);
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
            console.log(`Loading more products: ${prev} -> ${newCount} of ${filteredItems.length}`);
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
    <>
      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Products Count */}
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Showing {displayedItems.length} of {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* Products Grid */}
      {displayedItems.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
    </>
  );
}

