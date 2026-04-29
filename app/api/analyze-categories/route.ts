import { NextResponse } from 'next/server';
import { getSquareItems, getSquareCategories, getSquareClient } from '@/lib/square';

function toSerializable(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(toSerializable);
  if (typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toSerializable(v);
    }
    return out;
  }
  return value;
}

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({ error: 'Square client not initialized' }, { status: 503 });
    }

    // Fetch all items and categories
    const [allItems, categoryMap] = await Promise.all([
      getSquareItems(),
      getSquareCategories(),
    ]);

    // Filter items the same way as the homepage (presentAtAllLocations + has images)
    const filteredItems = allItems.filter((item: any) => {
      const imageIds = item.itemData?.imageIds || [];
      const availableEverywhere = item.presentAtAllLocations === true;
      return availableEverywhere && imageIds.length > 0;
    });

    // Get categories that appear in filtered items (visible categories)
    const visibleCategorySet = new Set<string>();
    filteredItems.forEach((item: any) => {
      if (item.itemData?.categories) {
        item.itemData.categories.forEach((cat: any) => {
          if (cat.id && categoryMap[cat.id]) {
            visibleCategorySet.add(cat.id);
          }
        });
      }
    });

    // Get categories that appear in all items but not in filtered items (hidden categories)
    const allCategorySet = new Set<string>();
    allItems.forEach((item: any) => {
      if (item.itemData?.categories) {
        item.itemData.categories.forEach((cat: any) => {
          if (cat.id && categoryMap[cat.id]) {
            allCategorySet.add(cat.id);
          }
        });
      }
    });

    const hiddenCategoryIds = Array.from(allCategorySet).filter(id => !visibleCategorySet.has(id));

    // Fetch full category objects from Square to analyze their properties
    const { result } = await client.catalogApi.searchCatalogObjects({
      objectTypes: ['CATEGORY'],
      limit: 1000,
    });

    const categoryDetails: Record<string, any> = {};
    if (result.objects) {
      result.objects.forEach((cat: any) => {
        if (cat.id) {
          // Get all items in this category
          const categoryItems = allItems.filter((item: any) => 
            item.itemData?.categories?.some((c: any) => c.id === cat.id)
          );
          const visibleCategoryItems = filteredItems.filter((item: any) => 
            item.itemData?.categories?.some((c: any) => c.id === cat.id)
          );
          
          // Check if any items in this category have presentAtAllLocations=false
          const itemsWithLocationRestrictions = categoryItems.filter((item: any) => 
            item.presentAtAllLocations === false
          );
          
          // Capture ALL properties from the category object
          // Use toSerializable to handle BigInt and nested objects properly
          const allCategoryProperties = toSerializable(cat);

          categoryDetails[cat.id] = {
            id: cat.id,
            name: cat.categoryData?.name || '(unnamed)',
            isVisible: visibleCategorySet.has(cat.id),
            isHidden: hiddenCategoryIds.includes(cat.id),
            // All category properties (complete capture)
            allProperties: allCategoryProperties,
            // Category properties (key ones for comparison)
            properties: {
              // Present at locations (similar to items)
              presentAtAllLocations: cat.presentAtAllLocations,
              presentAtLocationIds: cat.presentAtLocationIds || [],
              absentAtLocationIds: cat.absentAtLocationIds || [],
              // Category data properties
              ordinal: typeof cat.categoryData?.ordinal === 'bigint' 
                ? Number(cat.categoryData.ordinal) 
                : cat.categoryData?.ordinal,
              // Version info
              version: typeof cat.version === 'bigint' ? Number(cat.version) : cat.version,
              // Type
              type: cat.type,
              // Is deleted
              isDeleted: cat.isDeleted || false,
            },
            // Count items in this category
            itemCounts: {
              total: categoryItems.length,
              visible: visibleCategoryItems.length,
              withImages: categoryItems.filter((item: any) => 
                (item.itemData?.imageIds || []).length > 0
              ).length,
              withPresentAtAllLocations: categoryItems.filter((item: any) => 
                item.presentAtAllLocations === true
              ).length,
              withLocationRestrictions: itemsWithLocationRestrictions.length,
            },
            // Sample items to understand the pattern
            sampleItems: categoryItems.slice(0, 3).map((item: any) => ({
              id: item.id,
              name: item.itemData?.name,
              presentAtAllLocations: item.presentAtAllLocations,
              hasImages: (item.itemData?.imageIds || []).length > 0,
            })),
          };
        }
      });
    }

    // Analyze patterns
    const visibleCategories = Object.values(categoryDetails).filter((c: any) => c.isVisible);
    const hiddenCategories = Object.values(categoryDetails).filter((c: any) => c.isHidden);

    // Compare all properties between visible and hidden categories
    const propertyComparison: any = {};
    
    // Get all unique property keys from all categories
    const allPropertyKeys = new Set<string>();
    Object.values(categoryDetails).forEach((cat: any) => {
      if (cat.allProperties) {
        Object.keys(cat.allProperties).forEach(key => allPropertyKeys.add(key));
        if (cat.allProperties.categoryData) {
          Object.keys(cat.allProperties.categoryData).forEach(key => 
            allPropertyKeys.add(`categoryData.${key}`)
          );
        }
      }
    });

    // Compare each property value across visible vs hidden
    allPropertyKeys.forEach(propKey => {
      const visibleValues = visibleCategories.map((cat: any) => {
        if (propKey.startsWith('categoryData.')) {
          const dataKey = propKey.replace('categoryData.', '');
          return cat.allProperties?.categoryData?.[dataKey];
        }
        return cat.allProperties?.[propKey];
      }).filter(v => v !== undefined);
      
      const hiddenValues = hiddenCategories.map((cat: any) => {
        if (propKey.startsWith('categoryData.')) {
          const dataKey = propKey.replace('categoryData.', '');
          return cat.allProperties?.categoryData?.[dataKey];
        }
        return cat.allProperties?.[propKey];
      }).filter(v => v !== undefined);

      // Get unique values
      const visibleUnique = Array.from(new Set(visibleValues.map(v => JSON.stringify(v))));
      const hiddenUnique = Array.from(new Set(hiddenValues.map(v => JSON.stringify(v))));
      
      // Find differences
      const onlyInVisible = visibleUnique.filter(v => !hiddenUnique.includes(v));
      const onlyInHidden = hiddenUnique.filter(v => !visibleUnique.includes(v));
      const inBoth = visibleUnique.filter(v => hiddenUnique.includes(v));

      propertyComparison[propKey] = {
        visibleCount: visibleValues.length,
        hiddenCount: hiddenValues.length,
        visibleUniqueValues: visibleUnique.slice(0, 10), // Limit to first 10 for readability
        hiddenUniqueValues: hiddenUnique.slice(0, 10),
        onlyInVisible: onlyInVisible.slice(0, 10),
        onlyInHidden: onlyInHidden.slice(0, 10),
        inBoth: inBoth.slice(0, 10),
        hasDifference: onlyInVisible.length > 0 || onlyInHidden.length > 0,
      };
    });

    const analysis = {
      summary: {
        totalCategories: Object.keys(categoryMap).length,
        visibleCategories: visibleCategories.length,
        hiddenCategories: hiddenCategories.length,
      },
      patterns: {
        presentAtAllLocations: {
          visible: {
            true: visibleCategories.filter((c: any) => c.properties.presentAtAllLocations === true).length,
            false: visibleCategories.filter((c: any) => c.properties.presentAtAllLocations === false).length,
            undefined: visibleCategories.filter((c: any) => c.properties.presentAtAllLocations === undefined).length,
          },
          hidden: {
            true: hiddenCategories.filter((c: any) => c.properties.presentAtAllLocations === true).length,
            false: hiddenCategories.filter((c: any) => c.properties.presentAtAllLocations === false).length,
            undefined: hiddenCategories.filter((c: any) => c.properties.presentAtAllLocations === undefined).length,
          },
        },
        hasLocationIds: {
          visible: visibleCategories.filter((c: any) => 
            (c.properties.presentAtLocationIds?.length || 0) > 0
          ).length,
          hidden: hiddenCategories.filter((c: any) => 
            (c.properties.presentAtLocationIds?.length || 0) > 0
          ).length,
        },
        isDeleted: {
          visible: visibleCategories.filter((c: any) => c.properties.isDeleted === true).length,
          hidden: hiddenCategories.filter((c: any) => c.properties.isDeleted === true).length,
        },
      },
      visibleCategories: visibleCategories.map((c: any) => ({
        name: c.name,
        id: c.id,
        presentAtAllLocations: c.properties.presentAtAllLocations,
        itemCounts: c.itemCounts,
        allProperties: c.allProperties,
      })),
      hiddenCategories: hiddenCategories.map((c: any) => ({
        name: c.name,
        id: c.id,
        presentAtAllLocations: c.properties.presentAtAllLocations,
        itemCounts: c.itemCounts,
        reason: c.itemCounts.visible === 0 ? 'No items with presentAtAllLocations=true and images' : 'Unknown',
        allProperties: c.allProperties,
      })),
      propertyComparison: propertyComparison,
      differences: Object.entries(propertyComparison)
        .filter(([_, comp]: [string, any]) => comp.hasDifference)
        .map(([key, comp]: [string, any]) => ({
          property: key,
          onlyInVisible: comp.onlyInVisible,
          onlyInHidden: comp.onlyInHidden,
          visibleUniqueCount: comp.visibleUniqueValues.length,
          hiddenUniqueCount: comp.hiddenUniqueValues.length,
        })),
      allCategoryDetails: categoryDetails,
    };

    return NextResponse.json(toSerializable(analysis));
  } catch (error: any) {
    console.error('Error analyzing categories:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze categories' }, { status: 500 });
  }
}
