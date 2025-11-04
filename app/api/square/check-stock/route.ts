import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { getItemVariations } from '@/lib/square';

// Simple in-memory cache for stock status (TTL: 5 minutes)
const stockCache = new Map<string, { outOfStock: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId parameter' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = stockCache.get(itemId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ outOfStock: cached.outOfStock, cached: true });
    }

    const client = getSquareClient();
    if (!client) {
      // Default to in stock if client not available
      return NextResponse.json({ outOfStock: false });
    }

    // Get location ID based on environment
    const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    const locationId = environment === 'production'
      ? (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID)
      : (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID);
    
    if (!locationId) {
      return NextResponse.json({ outOfStock: false });
    }

    // Get the item to check its variations
    const { result } = await client.catalogApi.retrieveCatalogObject(itemId, true);
    const item = result.object;
    
    if (!item || !item.itemData) {
      return NextResponse.json({ outOfStock: false });
    }

    const variations = getItemVariations(item);
    if (variations.length === 0) {
      return NextResponse.json({ outOfStock: true });
    }

    // If no variations track inventory, assume in stock
    const trackingVariations = variations.filter(v => v.trackInventory);
    if (trackingVariations.length === 0) {
      return NextResponse.json({ outOfStock: false });
    }

    // Get variation IDs
    const variationIds = trackingVariations.map(v => v.id);

    // Query inventory counts for all variations at the location
    const { result: inventoryResult } = await client.inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: variationIds,
      locationIds: [locationId],
    });

    if (!inventoryResult.counts || inventoryResult.counts.length === 0) {
      // No inventory counts found - could mean out of stock or not tracking
      return NextResponse.json({ outOfStock: true });
    }

    // Check if any variation has quantity > 0
    const hasStock = inventoryResult.counts.some((count: any) => {
      const quantity = typeof count.quantity === 'string' 
        ? parseInt(count.quantity, 10) 
        : (typeof count.quantity === 'bigint' ? Number(count.quantity) : count.quantity || 0);
      return quantity > 0;
    });

    const outOfStock = !hasStock;
    
    // Cache the result
    stockCache.set(itemId, { outOfStock, timestamp: Date.now() });
    
    // Clean up old cache entries periodically
    if (stockCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of stockCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          stockCache.delete(key);
        }
      }
    }

    return NextResponse.json({ outOfStock });
  } catch (error: any) {
    // Check for rate limiting errors (429 Too Many Requests)
    if (error.statusCode === 429 || error.response?.status === 429) {
      console.error(`[StockAPI] Rate limit hit for item ${itemId}. Using cached value if available.`);
      
      // Try to use cached value even if expired
      const cached = stockCache.get(itemId);
      if (cached) {
        console.warn(`[StockAPI] Returning stale cache for ${itemId} due to rate limit`);
        return NextResponse.json({ outOfStock: cached.outOfStock, cached: true, stale: true });
      }
      
      // Return 429 with retry-after header if provided
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          outOfStock: false, // Default to in stock to avoid blocking purchases
          retryAfter: error.response?.headers?.['retry-after'] || 60
        },
        { status: 429 }
      );
    }
    
    console.error(`[StockAPI] Error checking stock for ${itemId}:`, {
      error: error.message || String(error),
      statusCode: error.statusCode,
      stack: error.stack,
    });
    
    // Try to use cached value on any error
    const cached = stockCache.get(itemId);
    if (cached) {
      console.warn(`[StockAPI] Returning cached value for ${itemId} due to error`);
      return NextResponse.json({ outOfStock: cached.outOfStock, cached: true, stale: true });
    }
    
    // Default to in stock on error
    return NextResponse.json({ outOfStock: false });
  }
}

