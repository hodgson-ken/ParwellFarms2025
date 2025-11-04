import Link from 'next/link';
import { getSquareItems } from '@/lib/square';
import ProductCard from '@/components/ProductCard';

interface ProductsPageProps {
  searchParams: { category?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const allItems = await getSquareItems();
  
  // Filter by category if specified
  let filteredItems = allItems;
  if (searchParams.category) {
    const category = searchParams.category.toLowerCase();
    filteredItems = allItems.filter((item) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      const description = item.itemData?.description?.toLowerCase() || '';
      const tags = item.itemData?.categories?.map((cat: any) => cat.name?.toLowerCase() || '') || [];
      
      return (
        name.includes(category) ||
        description.includes(category) ||
        tags.some((tag: string) => tag.includes(category))
      );
    });
  }

  const categoryNames: Record<string, string> = {
    soaps: 'Soaps',
    lotions: 'Lotions',
    lavender: 'Lavender Products',
    salves: 'Salves & Balms',
    chapstick: 'Chapstick',
    apparel: 'Apparel',
    home: 'Home Goods',
    gifts: 'Gifts',
  };

  const categoryTitle = searchParams.category 
    ? categoryNames[searchParams.category] || searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)
    : 'All Products';

  return (
    <div className="py-12 bg-farm-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            {categoryTitle}
          </h1>
          {searchParams.category && (
            <Link href="/products" className="text-lavender-600 hover:text-lavender-700">
              ← View All Products
            </Link>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No products found in this category.</p>
            <Link href="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

