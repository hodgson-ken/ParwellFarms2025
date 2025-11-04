import { NextResponse } from 'next/server';
import { getSquareItems, getSquareClient } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({ error: 'Square client not initialized' }, { status: 503 });
    }

    const items = await getSquareItems();
    
    // Find the specific products mentioned
    const targetProducts = [
      'Fire Cider',
      'Tallow Soap',
      'Whipped Tallow',
      'Goat Milk Honey Soap',
      'Hoe t shirt',
      '72% Marseille Soap Cube 300g'
    ];

    // Get category names
    const categoryMap: Record<string, string> = {};
    try {
      const { result } = await client.catalogApi.searchCatalogObjects({
        objectTypes: ['CATEGORY'],
        limit: 1000,
      });
      
      if (result.objects) {
        result.objects.forEach((cat: any) => {
          if (cat.categoryData?.name) {
            categoryMap[cat.id] = cat.categoryData.name;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }

    // Find matching products (case-insensitive partial match)
    const foundProducts = items
      .filter((item: any) => {
        const name = item.itemData?.name || '';
        return targetProducts.some(target => 
          name.toLowerCase().includes(target.toLowerCase()) || 
          target.toLowerCase().includes(name.toLowerCase())
        );
      })
      .map((item: any) => {
        const categories = item.itemData?.categories?.map((cat: any) => ({
          id: cat.id,
          name: categoryMap[cat.id] || 'Unknown',
          ordinal: typeof cat.ordinal === 'bigint' ? Number(cat.ordinal) : (cat.ordinal || 0),
        })) || [];

        const reportingCategory = item.itemData?.reportingCategory ? {
          id: item.itemData.reportingCategory.id,
          ordinal: typeof item.itemData.reportingCategory.ordinal === 'bigint'
            ? Number(item.itemData.reportingCategory.ordinal)
            : (item.itemData.reportingCategory.ordinal || 0),
        } : null;

        return {
          id: item.id,
          name: item.itemData?.name,
          indexInApiResult: items.indexOf(item),
          categories,
          reportingCategory,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Check if there are any other ordering fields
          allFields: Object.keys(item.itemData || {}),
        };
      });

    // Also return the first 10 products in order to see the pattern
    const firstTen = items.slice(0, 10).map((item: any, index: number) => ({
      index,
      name: item.itemData?.name,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      foundProducts,
      firstTenInOrder: firstTen,
      totalItems: items.length,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

