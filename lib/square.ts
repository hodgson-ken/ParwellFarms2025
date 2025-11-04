import { Client, Environment, ApiError } from 'square/legacy';

// Initialize Square client
export function getSquareClient() {
  const env = process.env.SQUARE_ENVIRONMENT || 'sandbox';
  const isProduction = env === 'production';
  
  // Support both formats: direct SQUARE_ACCESS_TOKEN or environment-specific
  let accessToken = process.env.SQUARE_ACCESS_TOKEN;
  
  // If SQUARE_ACCESS_TOKEN is not set, try environment-specific tokens
  if (!accessToken) {
    if (isProduction) {
      accessToken = process.env.SQUARE_ACCESS_TOKEN_PRODUCTION;
    } else {
      accessToken = process.env.SQUARE_ACCESS_TOKEN_SANDBOX;
    }
  }
  
  const environment = isProduction 
    ? Environment.Production 
    : Environment.Sandbox;

  if (!accessToken) {
    // Return null instead of throwing - allows preview mode without Square
    return null;
  }

  return new Client({
    accessToken,
    environment,
  });
}

// Fetch all items from Square Catalog with pagination
export async function getSquareItems() {
  try {
    const client = getSquareClient();
    if (!client) {
      console.warn('Square credentials not configured - running in preview mode');
      return [];
    }

    const allItems: any[] = [];
    let cursor: string | undefined = undefined;
    const limit = 100; // Maximum per request

    do {
      const searchParams: any = {
        limit,
      };

      if (cursor) {
        searchParams.cursor = cursor;
      }

      // Square API returns items in Square's internal display order
      // This should match the order shown in Square's online store
      const { result } = await client.catalogApi.searchCatalogItems(searchParams);

      // Filter to only return ITEM type objects and exclude archived items
      const items = result.items?.filter((item: any) => 
        item.type === 'ITEM' && !item.itemData?.isArchived
      ) || [];

      allItems.push(...items);

      // Check if there are more results
      cursor = result.cursor;
    } while (cursor);

    return allItems;
  } catch (error: any) {
    console.error('Error fetching Square items:', error);
    if (ApiError && error instanceof ApiError) {
      console.error('Square API Error:', error.errors);
    }
    return [];
  }
}

// Fetch all categories from Square Catalog and return as a map of ID to name
export async function getSquareCategories() {
  try {
    const client = getSquareClient();
    if (!client) {
      return {};
    }
    const { result } = await client.catalogApi.searchCatalogObjects({
      objectTypes: ['CATEGORY'],
      limit: 1000,
    });
    
    const categoryMap: Record<string, string> = {};
    if (result.objects) {
      result.objects.forEach((cat: any) => {
        if (cat.categoryData?.name) {
          categoryMap[cat.id] = cat.categoryData.name;
        }
      });
    }
    return categoryMap;
  } catch (error: any) {
    console.error('Error fetching Square categories:', error);
    return {};
  }
}

// Fetch a single item by ID
export async function getSquareItemById(itemId: string) {
  try {
    const client = getSquareClient();
    if (!client) {
      console.warn('Square credentials not configured - running in preview mode');
      return null;
    }
    const { result } = await client.catalogApi.retrieveCatalogObject(itemId, true);
    
    return result.object || null;
  } catch (error) {
    console.error('Error fetching Square item:', error);
    return null;
  }
}

// Check if a variation is in stock (using Inventory API)
export async function checkVariationStock(variationId: string): Promise<boolean> {
  try {
    const client = getSquareClient();
    if (!client) return true; // Default to in stock if client not available
    
    // Get location ID based on environment
    const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    const locationId = environment === 'production'
      ? (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID)
      : (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID);
    
    if (!locationId) return true; // Default to in stock if location not configured
    
    // Query inventory counts for this variation at the location
    const { result } = await client.inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: [variationId],
      locationIds: [locationId],
    });
    
    if (!result.counts || result.counts.length === 0) {
      // No inventory count found - assume in stock if not tracking inventory
      return true;
    }
    
    // Check if any location has quantity > 0
    return result.counts.some((count: any) => {
      const quantity = typeof count.quantity === 'string' 
        ? parseInt(count.quantity, 10) 
        : (typeof count.quantity === 'bigint' ? Number(count.quantity) : count.quantity || 0);
      return quantity > 0;
    });
  } catch (error) {
    console.error('Error checking inventory:', error);
    return true; // Default to in stock on error
  }
}

// Get item variations with pricing and stock status
export function getItemVariations(item: any) {
  if (!item.itemData?.variations) return [];
  
  return item.itemData.variations.map((variation: any) => {
    let amount: number | null = null;
    if (variation.itemVariationData?.priceMoney?.amount) {
      // Convert BigInt or string to number
      const amountValue = variation.itemVariationData.priceMoney.amount;
      amount = typeof amountValue === 'bigint' 
        ? Number(amountValue) 
        : typeof amountValue === 'string' 
          ? parseInt(amountValue, 10) 
          : amountValue;
    }
    
    // Check if inventory tracking is enabled
    const trackInventory = variation.itemVariationData?.trackInventory !== false;
    
    return {
      id: variation.id,
      name: variation.itemVariationData?.name || 'Default',
      price: amount !== null 
        ? {
            amount,
            currency: variation.itemVariationData.priceMoney.currency || 'USD',
          }
        : null,
      sku: variation.itemVariationData?.sku,
      available: trackInventory,
      trackInventory: trackInventory,
    };
  });
}

// Check if an item is out of stock (all variations out of stock)
export async function isItemOutOfStock(item: any): Promise<boolean> {
  const variations = getItemVariations(item);
  if (variations.length === 0) return true;
  
  // If no variations track inventory, assume in stock
  const trackingVariations = variations.filter(v => v.trackInventory);
  if (trackingVariations.length === 0) return false;
  
  // Check stock for all variations that track inventory
  const stockChecks = await Promise.all(
    trackingVariations.map(v => checkVariationStock(v.id))
  );
  
  // Item is out of stock if ALL tracking variations are out of stock
  return !stockChecks.some(inStock => inStock);
}

// Format price for display
export function formatPrice(price: { amount: number; currency: string } | null) {
  if (!price) return 'Price not available';
  
  const amount = price.amount / 100; // Square stores amounts in cents
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD',
  }).format(amount);
}

// Customer management functions
export async function getCustomerById(customerId: string) {
  try {
    const client = getSquareClient();
    if (!client) {
      console.warn('Square credentials not configured');
      return null;
    }
    const { result } = await client.customersApi.retrieveCustomer(customerId);
    return result.customer || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

export async function searchCustomerByPhoneNumber(phoneNumber: string) {
  try {
    const client = getSquareClient();
    if (!client) {
      console.warn('Square credentials not configured');
      return null;
    }
    const { result } = await client.customersApi.searchCustomers({
      query: {
        filter: {
          phoneNumber: {
            exact: phoneNumber,
          },
        },
      },
    });
    return result.customers?.[0] || null;
  } catch (error) {
    console.error('Error searching customer:', error);
    return null;
  }
}

