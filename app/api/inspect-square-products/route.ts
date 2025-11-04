import { NextResponse } from 'next/server';
import { getSquareItems, getSquareClient } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({
        error: 'Square client not initialized'
      }, { status: 503 });
    }

    const items = await getSquareItems();
    
    if (items.length === 0) {
      return NextResponse.json({
        error: 'No products found',
        message: 'Square catalog is empty or not connected'
      }, { status: 404 });
    }

    // Fetch all categories to get their names
    const categoryIdToName: Record<string, string> = {};
    try {
      const { result } = await client.catalogApi.searchCatalogObjects({
        objectTypes: ['CATEGORY'],
        limit: 1000,
      });
      
      if (result.objects) {
        result.objects.forEach((cat: any) => {
          if (cat.categoryData?.name) {
            categoryIdToName[cat.id] = cat.categoryData.name;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }

    // Helper to convert BigInt to number for serialization
    const convertBigInt = (value: any): any => {
      if (typeof value === 'bigint') {
        return Number(value);
      }
      if (Array.isArray(value)) {
        return value.map(convertBigInt);
      }
      if (value && typeof value === 'object') {
        const result: any = {};
        for (const [key, val] of Object.entries(value)) {
          result[key] = convertBigInt(val);
        }
        return result;
      }
      return value;
    };

    // Analyze first few products to extract all possible organizational properties
    const sampleItems = items.slice(0, 5);
    
    const analysis = {
      totalItems: items.length,
      sampleSize: sampleItems.length,
      sampleItems: sampleItems.map((item: any) => ({
        id: item.id,
        name: item.itemData?.name,
        type: item.type,
        // Extract all organizational properties
        organizationalProperties: {
          // Categories
          categories: item.itemData?.categories?.map((cat: any) => ({
            id: cat.id,
            name: categoryIdToName[cat.id] || '(name not found)',
            ordinal: typeof cat.ordinal === 'bigint' ? Number(cat.ordinal) : cat.ordinal,
          })) || [],
          
          // Reporting Category
          reportingCategory: item.itemData?.reportingCategory ? {
            id: item.itemData.reportingCategory.id,
            ordinal: typeof item.itemData.reportingCategory.ordinal === 'bigint' 
              ? Number(item.itemData.reportingCategory.ordinal) 
              : item.itemData.reportingCategory.ordinal,
          } : null,
          
          // Product Type
          productType: item.itemData?.productType,
          
          // Tax IDs (could be used for categorization)
          taxIds: item.itemData?.taxIds || [],
          
          // Is Taxable
          isTaxable: item.itemData?.isTaxable,
          
          // Channels (where product is sold)
          channels: item.channels || [],
          
          // Present at locations
          presentAtAllLocations: item.presentAtAllLocations,
          presentAtLocationIds: item.presentAtLocationIds || [],
          absentAtLocationIds: item.absentAtLocationIds || [],
          
          // Label Color (if used for organization)
          labelColor: item.itemData?.labelColor,
          
          // SKU (from variations)
          skus: item.itemData?.variations?.map((v: any) => v.itemVariationData?.sku).filter(Boolean) || [],
          
          // Tags/Custom Attributes (check if Square has these)
          // Square doesn't have traditional tags, but we can check for other metadata
        },
        
        // Full item structure for reference
        fullStructure: {
          itemData: Object.keys(item.itemData || {}),
        }
      })),
      
      // Collect all unique values across all products
      allCategories: [...new Set(
        items.flatMap((item: any) => 
          item.itemData?.categories?.map((cat: any) => categoryIdToName[cat.id] || cat.id) || []
        )
      )].sort(),
      
      categoryDetails: Object.entries(categoryIdToName).map(([id, name]) => ({
        id,
        name,
      })).sort((a, b) => a.name.localeCompare(b.name)),
      
      allProductTypes: [...new Set(
        items.map((item: any) => item.itemData?.productType).filter(Boolean)
      )].sort(),
      
      allChannels: [...new Set(
        items.flatMap((item: any) => item.channels || [])
      )],
      
      allLabelColors: [...new Set(
        items.map((item: any) => item.itemData?.labelColor).filter(Boolean)
      )].sort(),
      
      hasReportingCategory: items.filter((item: any) => item.itemData?.reportingCategory).length,
      
      // Variation-based properties
      variationProperties: {
        pricingTypes: [...new Set(
          items.flatMap((item: any) =>
            item.itemData?.variations?.map((v: any) => 
              v.itemVariationData?.pricingType
            ) || []
          )
        )].filter(Boolean).sort(),
        
        hasTrackInventory: items.filter((item: any) =>
          item.itemData?.variations?.some((v: any) => 
            v.itemVariationData?.trackInventory
          )
        ).length,
        
        hasSKU: items.filter((item: any) =>
          item.itemData?.variations?.some((v: any) => 
            v.itemVariationData?.sku
          )
        ).length,
      },
      
      // Description fields that might contain category info
      descriptionFields: {
        hasDescription: items.filter((item: any) => item.itemData?.description).length,
        hasDescriptionHtml: items.filter((item: any) => item.itemData?.descriptionHtml).length,
        hasDescriptionPlaintext: items.filter((item: any) => item.itemData?.descriptionPlaintext).length,
      },
    };

    return NextResponse.json(analysis, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

