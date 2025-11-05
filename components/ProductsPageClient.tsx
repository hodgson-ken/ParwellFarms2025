'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import PlaceholderProductCard from '@/components/PlaceholderProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { useSearch } from '@/contexts/SearchContext';

interface PlaceholderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface ProductsPageClientProps {
  products: PlaceholderProduct[];
  categories: string[];
}

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPageClient({ products, categories }: ProductsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { setProducts } = useSearch();

  // Update search context with products (convert to format expected by SearchModal)
  useEffect(() => {
    const searchProducts = products.map((p) => ({
      id: p.id,
      itemData: {
        name: p.name,
        imageIds: [p.imageUrl], // Use imageUrl as imageId for placeholder products
      },
    }));
    setProducts(searchProducts);
  }, [products, setProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = selectedCategory === 'All' 
      ? products 
      : products.filter(product => product.category === selectedCategory);
    
    // Sort in reverse order (last items in array = newest added = show first)
    // This simulates newest-first ordering for placeholders
    return [...filtered].reverse();
  }, [products, selectedCategory]);

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
    const hasMore = displayCount < filteredProducts.length;
    if (!hasMore) return; // Don't set up observer if all items are displayed

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredProducts.length) {
          setDisplayCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [displayCount, filteredProducts.length]);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

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
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProducts.map((product) => (
              <PlaceholderProductCard key={product.id} product={product} />
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

