import type { Metadata } from 'next';
import { getSquareItemById } from '@/lib/square';
import { formatPrice, getItemVariations } from '@/lib/square';
import { getPlaceholderProductById } from '@/data/placeholderProducts';
import ProductDetailActions from '@/components/ProductDetailActions';
import PlaceholderProductDetail from '@/components/PlaceholderProductDetail';
import ProductImage from '@/components/ProductImage';
import { notFound } from 'next/navigation';

interface ProductDetailPageProps {
  params: { id: string };
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

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Check if this is a placeholder product first
  const placeholderProduct = getPlaceholderProductById(params.id);
  
  if (placeholderProduct) {
    return <PlaceholderProductDetail product={placeholderProduct} />;
  }

  // Otherwise, try to get from Square
  const item = await getSquareItemById(params.id);
  
  if (!item || !item.itemData) {
    notFound();
  }

  const variations = getItemVariations(item);
  const imageId = item.itemData.imageIds?.[0];
  // Try cached image first (served as static file), API route handles uncached images
  const imageUrl = imageId 
    ? `/cached-images/${imageId}.jpg` 
    : '/placeholder-product.jpg';

  return (
    <div className="py-12 bg-farm-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <ProductImage
              src={imageUrl}
              alt={item.itemData.name || 'Product'}
              imageId={imageId}
            />
          </div>

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

            {item.itemData.description && (
              <div className="mb-8">
                <h2 className="text-xl font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {item.itemData.description}
                </p>
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

