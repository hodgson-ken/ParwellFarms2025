import { getSquareClient } from './square';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.image-validation-cache.json');
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds - validation rarely changes

interface ImageValidationCache {
  timestamp: number;
  validProductIds: Set<string>;
  invalidProductIds: Set<string>;
}

let memoryCache: ImageValidationCache | null = null;

/**
 * Load validation cache from file (synchronous for speed)
 */
function loadCacheSync(): ImageValidationCache | null {
  // Return memory cache if available and fresh
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL) {
    return memoryCache;
  }

  // Try to load from disk synchronously for speed
  try {
    if (existsSync(CACHE_FILE)) {
      const { readFileSync } = require('fs');
      const data = readFileSync(CACHE_FILE, 'utf-8');
      const cache = JSON.parse(data);
      
      // Check if cache is still fresh
      if (Date.now() - cache.timestamp < CACHE_TTL) {
        memoryCache = {
          timestamp: cache.timestamp,
          validProductIds: new Set(cache.validProductIds || []),
          invalidProductIds: new Set(cache.invalidProductIds || []),
        };
        return memoryCache;
      }
    }
  } catch (error) {
    // Cache file doesn't exist or is corrupted, create new cache
    // Only warn in development to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not load image validation cache:', error);
    }
  }

  return null;
}

/**
 * Save validation cache to file
 */
async function saveCache(cache: ImageValidationCache): Promise<void> {
  memoryCache = cache;
  
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    if (!existsSync(cacheDir)) {
      const { mkdir } = await import('fs/promises');
      await mkdir(cacheDir, { recursive: true });
    }

    await writeFile(
      CACHE_FILE,
      JSON.stringify({
        timestamp: cache.timestamp,
        validProductIds: Array.from(cache.validProductIds),
        invalidProductIds: Array.from(cache.invalidProductIds),
      }),
      'utf-8'
    );
  } catch (error) {
    console.warn('Could not save image validation cache:', error);
  }
}

/**
 * Check if a Square product has a valid image (uses cache)
 * @param item Product item with id and imageIds
 * @param cache Cache object
 * @returns true if at least one image ID is valid
 */
async function hasValidImageUncached(item: any): Promise<boolean> {
  const imageIds = item.itemData?.imageIds || [];
  
  if (imageIds.length === 0) {
    return false;
  }

  const client = getSquareClient();
  if (!client) {
    return false;
  }

  // Check if at least one image exists
  for (const imageId of imageIds) {
    try {
      const { result } = await client.catalogApi.retrieveCatalogObject(imageId, false);
      if (result.object?.imageData?.url) {
        return true;
      }
      // If object exists but no imageData.url, continue to next imageId
    } catch (error: any) {
      // Log error details for debugging (only in development)
      if (process.env.NODE_ENV === 'development' && error?.errors) {
        // Only log if it's a significant error (not just 404)
        const isSignificantError = !error.errors.some((e: any) => e.code === 'NOT_FOUND');
        if (isSignificantError) {
          console.warn(`Error validating image ${imageId} for product ${item.itemData?.name}:`, error.errors?.[0]?.detail || error.message);
        }
      }
      continue;
    }
  }

  return false;
}

/**
 * Filter products to only include those with valid images
 * Uses cache to avoid repeated API calls
 * @param items Array of Square catalog items
 * @returns Filtered array containing only items with valid images
 */
export async function filterProductsWithValidImages(items: any[]): Promise<any[]> {
  const client = getSquareClient();
  if (!client) {
    return [];
  }

  // Load cache synchronously for speed (no async overhead)
  let cache = loadCacheSync();
  if (!cache) {
    cache = {
      timestamp: Date.now(),
      validProductIds: new Set(),
      invalidProductIds: new Set(),
    };
  }

  const validItems: any[] = [];
  const itemsToValidate: any[] = [];
  const validationPromises: Promise<any>[] = [];

  // Separate items into cached (known) and uncached (need validation)
  for (const item of items) {
    const productId = item.id;
    
    if (cache.validProductIds.has(productId)) {
      // Known valid - use immediately
      validItems.push(item);
    } else if (cache.invalidProductIds.has(productId)) {
      // Known invalid - skip
      continue;
    } else {
      // Unknown - needs validation
      itemsToValidate.push(item);
    }
  }

  // If all items are cached, return immediately
  if (itemsToValidate.length === 0) {
    return validItems;
  }

  if (itemsToValidate.length > 0) {
    console.log(`Validating ${itemsToValidate.length} products with unknown image status...`);
  }

  // Validate unknown items in batches (smaller batches to avoid rate limiting)
  const batchSize = 5; // Reduced from 10 to avoid rate limits
  let validatedCount = 0;
  
  for (let i = 0; i < itemsToValidate.length; i += batchSize) {
    const batch = itemsToValidate.slice(i, i + batchSize);
    
    const batchPromise = Promise.all(
      batch.map(async (item) => {
        const productId = item.id;
        const hasImage = await hasValidImageUncached(item);
        
        if (hasImage) {
          cache.validProductIds.add(productId);
          validItems.push(item);
        } else {
          cache.invalidProductIds.add(productId);
        }
        
        validatedCount++;
        // Log progress every 50 items
        if (validatedCount % 50 === 0) {
          console.log(`Validated ${validatedCount}/${itemsToValidate.length} products... (${cache.validProductIds.size} valid so far)`);
        }
      })
    );

    validationPromises.push(batchPromise);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < itemsToValidate.length) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    }
  }

  // Wait for all validations to complete
  if (validationPromises.length > 0) {
    await Promise.all(validationPromises);
    
    // Update cache timestamp and save
    cache.timestamp = Date.now();
    await saveCache(cache);
    
    console.log(`Image validation complete: ${cache.validProductIds.size} valid, ${cache.invalidProductIds.size} invalid`);
  }

  return validItems;
}

