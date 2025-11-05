import type { Metadata } from 'next';
import { getSquareItemById, getSquareItems } from '@/lib/square';
import { formatPrice, getItemVariations } from '@/lib/square';
import { getPlaceholderProductById } from '@/data/placeholderProducts';
import ProductDetailActions from '@/components/ProductDetailActions';
import PlaceholderProductDetail from '@/components/PlaceholderProductDetail';
import ProductImageGallery from '@/components/ProductImageGallery';
import { notFound } from 'next/navigation';
import { processProductLinks, createProductNameMap } from '@/lib/processProductLinks';
import { unstable_cache } from 'next/cache';

interface ProductDetailPageProps {
  params: { id: string }; // Can be either slug or ID for backward compatibility
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const placeholderProduct = getPlaceholderProductById(params.id);
  if (placeholderProduct) {
    return {
      title: placeholderProduct.name,
    };
  }
  
  const item = await getSquareItemById(params.id);
  if (item?.itemData?.name) {
    return {
      title: item.itemData.name,
    };
  }
  
  return {
    title: 'Product',
  };
}

// Cache product name map for 5 minutes to avoid refetching on every page load
// Cache as array of entries since Maps don't serialize well
const getCachedProductNameMap = unstable_cache(
  async () => {
    const items = await getSquareItems();
    const nameMap = createProductNameMap(items);
    // Convert Map to array of entries for serialization
    return Array.from(nameMap.entries());
  },
  ['product-name-map'],
  { revalidate: 300 } // 5 minutes
);

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Check if this is a placeholder product first
  const placeholderProduct = getPlaceholderProductById(params.id);
  
  if (placeholderProduct) {
    return <PlaceholderProductDetail product={placeholderProduct} />;
  }

  // Get item by ID (fast, direct lookup)
  const item = await getSquareItemById(params.id);
  
  if (!item || !item.itemData) {
    notFound();
  }

  const variations = getItemVariations(item);
  // Ensure imageIds is always an array
  const imageIds = Array.isArray(item.itemData.imageIds) ? item.itemData.imageIds : [];
  const imageId = imageIds[0]; // For backwards compatibility with ProductDetailActions
  // Try cached image first (served as static file), API route handles uncached images
  const imageUrl = imageId 
    ? `/cached-images/${imageId}.jpg` 
    : '/placeholder-product.jpg';

  // Process product links in description
  const nameMapEntries = await getCachedProductNameMap();
  // Convert array of entries back to Map
  const nameMap = new Map(nameMapEntries);
  const processedDescriptionHtml = item.itemData.descriptionHtml 
    ? processProductLinks(item.itemData.descriptionHtml, nameMap)
    : null;

  return (
    <div className="py-12 bg-farm-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <ProductImageGallery
            imageIds={imageIds}
            productName={item.itemData.name || 'Product'}
          />

          {/* Product Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-4">
              {item.itemData.name}
            </h1>
            
            {variations.length > 0 && variations[0].price && (
              <div className="text-3xl font-bold text-lavender-600 mb-6">
                {formatPrice(variations[0].price)}
              </div>
            )}

            {(item.itemData.description || item.itemData.descriptionHtml) && (
              <div className="mb-8">
                <h2 className="text-xl font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                {processedDescriptionHtml ? (
                  <div 
                    className="product-description text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: processedDescriptionHtml
                        // Replace 3+ consecutive <br> tags with just <br><br> (allow double line breaks)
                        .replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />')
                    }}
                  />
                ) : item.itemData.description ? (
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {item.itemData.description}
                  </div>
                ) : null}
              </div>
            )}

            {/* Product Variations */}
            <div className="mb-8">
              <h2 className="text-xl font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-3">
                Select Option
              </h2>
              <ProductDetailActions
                itemId={item.id}
                itemName={item.itemData.name || 'Product'}
                variations={variations}
                item={item}
                imageUrl={imageUrl}
              />
            </div>

            {/* Additional Info */}
            {item.itemData.taxIds && item.itemData.taxIds.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <p className="text-sm text-gray-600">
                  Tax may apply. Final price calculated at checkout.
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

