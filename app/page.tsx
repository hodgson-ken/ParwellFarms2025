import { getSquareItems, getSquareCategories } from '@/lib/square';
import { filterProductsWithValidImages } from '@/lib/validate-images';
import ProductsPageClient from '@/components/ProductsPageClient';
import SquareProductsClient from '@/components/SquareProductsClient';
import DismissibleWarning from '@/components/DismissibleWarning';
import { placeholderProducts } from '@/data/placeholderProducts';
import { unstable_cache } from 'next/cache';

// Enable aggressive caching for the homepage
export const revalidate = 300; // Revalidate every 5 minutes (ISR - Incremental Static Regeneration)

// Cache the product data fetching for 5 minutes to speed up page loads
async function getCachedProducts() {
  return unstable_cache(
    async () => {
      // Check if Square client is configured first (before trying to fetch)
      const { getSquareClient } = await import('@/lib/square');
      const client = getSquareClient();
      const isConfigured = !!client;
      
      if (!isConfigured) {
        // Square credentials not configured - show placeholder mode
        return {
          squareItems: [],
          categories: Array.from(new Set(placeholderProducts.map(p => p.category))).sort(),
          categoryMap: {},
          hasSquareProducts: false,
          isConfigured: false,
        };
      }
      
      // Try to fetch items (may fail due to rate limits or other errors)
      const squareItems = await getSquareItems();
      const hasSquareProducts = squareItems.length > 0;
      
      if (!hasSquareProducts) {
        // API returned empty - could be rate limiting or no products
        // But client IS configured, so don't show the "not configured" warning
        console.warn('Square API returned no items - may be rate limited or catalog is empty');
        return {
          squareItems: [],
          categories: Array.from(new Set(placeholderProducts.map(p => p.category))).sort(),
          categoryMap: {},
          hasSquareProducts: false,
          isConfigured: true, // Still configured, just empty response
        };
      }

      // Fetch category names from Square
      const categoryMap = await getSquareCategories();
      
      // Show only products that are available at all locations and have imageIds
      // This aligns with the legacy site behavior of excluding location-limited items
      const itemsWithImages = squareItems.filter((item: any) => {
        const imageIds = item.itemData?.imageIds || [];
        const availableEverywhere = item.presentAtAllLocations === true;
        return availableEverywhere && imageIds.length > 0;
      });

      console.log(`Found ${itemsWithImages.length} products with imageIds out of ${squareItems.length} total products`);

      // Skip validation - show all products with imageIds
      // Images that fail to load will automatically show placeholder via ProductCard's onError handler
      const itemsWithValidImages = itemsWithImages;

      // Clean Square items to remove non-serializable values
      const cleanedItems = itemsWithValidImages.map((item: any) => {
        const cleaned: any = {
          id: item.id,
          type: item.type,
          updatedAt: item.updatedAt || item.createdAt || new Date(0).toISOString(),
          itemData: {
            name: item.itemData?.name,
            imageIds: item.itemData?.imageIds || [],
            description: item.itemData?.description,
            categories: item.itemData?.categories?.map((cat: any) => ({
              id: cat.id,
              ordinal: typeof cat.ordinal === 'bigint' 
                ? Number(cat.ordinal) 
                : (typeof cat.ordinal === 'number' ? cat.ordinal : 0),
            })) || [],
            reportingCategory: item.itemData?.reportingCategory ? {
              id: item.itemData.reportingCategory.id,
              ordinal: typeof item.itemData.reportingCategory.ordinal === 'bigint'
                ? Number(item.itemData.reportingCategory.ordinal)
                : (typeof item.itemData.reportingCategory.ordinal === 'number' ? item.itemData.reportingCategory.ordinal : 0),
            } : null,
            variations: item.itemData?.variations?.map((variation: any) => ({
              id: variation.id,
              itemVariationData: {
                name: variation.itemVariationData?.name,
                sku: variation.itemVariationData?.sku,
                priceMoney: variation.itemVariationData?.priceMoney ? {
                  amount: typeof variation.itemVariationData.priceMoney.amount === 'bigint'
                    ? Number(variation.itemVariationData.priceMoney.amount)
                    : typeof variation.itemVariationData.priceMoney.amount === 'string'
                      ? parseInt(variation.itemVariationData.priceMoney.amount, 10)
                      : variation.itemVariationData.priceMoney.amount,
                  currency: variation.itemVariationData.priceMoney.currency || 'USD',
                } : null,
              },
            })) || [],
          },
        };
        return cleaned;
      });

      // Extract unique category names from Square items
      const categorySet = new Set<string>();
      cleanedItems.forEach((item: any) => {
        if (item.itemData?.categories) {
          item.itemData.categories.forEach((cat: any) => {
            const categoryName = categoryMap[cat.id];
            if (categoryName) {
              categorySet.add(categoryName);
            }
          });
        }
      });
      const categories = Array.from(categorySet).sort();

      return {
        squareItems: cleanedItems,
        categories,
        categoryMap,
        hasSquareProducts: true,
        isConfigured: true,
      };
    },
    ['homepage-products'],
    {
      revalidate: 300, // Revalidate every 5 minutes (300 seconds)
      tags: ['products'],
    }
  )();
}

export default async function HomePage() {
  const { squareItems, categories, categoryMap, hasSquareProducts, isConfigured } = await getCachedProducts();

  return (
    <div className="py-12 bg-farm-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Show warning only if Square is NOT configured (not just if products are empty) */}
        {isConfigured === false && <DismissibleWarning />}

        {/* Render Square products or placeholders */}
        {hasSquareProducts ? (
          <SquareProductsClient 
            items={squareItems} 
            categories={categories}
            categoryMap={categoryMap}
          />
        ) : (
          <ProductsPageClient products={placeholderProducts} categories={categories} />
        )}
      </div>
    </div>
  );
}

