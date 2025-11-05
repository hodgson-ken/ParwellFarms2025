/**
 * Utility functions for generating and working with URL slugs from product names
 */

/**
 * Generates a URL-friendly slug from a product name
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace common special characters with hyphens
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '-')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length (optional, but good for SEO)
    .substring(0, 100);
}

/**
 * Creates a unique slug by appending a number if needed
 * This handles cases where multiple products might have the same name
 * Used internally when building the slug-to-ID mapping
 */
function createUniqueSlug(name: string, existingSlugs: Set<string>): string {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generates a slug-to-ID mapping for all products
 * This can be called when fetching products to build the mapping
 */
export function buildSlugToIdMap(items: Array<{ id: string; itemData?: { name?: string } }>): Map<string, string> {
  const slugToId = new Map<string, string>();
  const usedSlugs = new Set<string>();

  items.forEach((item) => {
    const name = item.itemData?.name || item.id;
    if (name) {
      const slug = createUniqueSlug(name, usedSlugs);
      slugToId.set(slug, item.id);
      usedSlugs.add(slug);
    }
  });

  return slugToId;
}

// Simple in-memory cache for slug-to-ID mapping (no database needed)
// Cache expires after 5 minutes to keep it fresh
let slugCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Gets product ID from slug by searching through items
 * Uses a simple in-memory cache to avoid fetching all products every time
 */
async function getIdFromSlug(slug: string): Promise<string | null> {
  // Import here to avoid circular dependencies
  const { getSquareItems } = await import('./square');
  
  try {
    // Check cache first
    const now = Date.now();
    if (slugCache && (now - cacheTimestamp) < CACHE_TTL) {
      return slugCache.get(slug) || null;
    }
    
    // Cache expired or doesn't exist - rebuild it
    const items = await getSquareItems();
    slugCache = buildSlugToIdMap(items);
    cacheTimestamp = now;
    
    return slugCache.get(slug) || null;
  } catch (error) {
    console.error('[slugs] Error fetching items for slug lookup:', error);
    return null;
  }
}

/**
 * Gets product by slug or ID - returns the full item object
 * Optimized: checks if it's an ID first (fast), then tries slug lookup
 */
export async function getItemBySlug(slugOrId: string) {
  // Import here to avoid circular dependencies
  const { getSquareItemById } = await import('./square');
  
  try {
    // OPTIMIZATION: Check if it looks like a Square ID first (much faster)
    // Square IDs are typically uppercase alphanumeric, 20+ characters
    const looksLikeId = slugOrId.length > 15 && /^[A-Z0-9]+$/.test(slugOrId);
    
    if (looksLikeId) {
      // Try ID lookup first (fast, no need to fetch all products)
      const itemById = await getSquareItemById(slugOrId);
      if (itemById) {
        return itemById;
      }
    }
    
    // Not an ID or ID lookup failed - try slug lookup
    const id = await getIdFromSlug(slugOrId);
    if (id) {
      return await getSquareItemById(id);
    }
    
    return null;
  } catch (error) {
    console.error('[slugs] Error getting item by slug/ID:', error);
    return null;
  }
}

