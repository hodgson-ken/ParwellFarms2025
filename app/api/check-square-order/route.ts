import { NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({ error: 'Square client not initialized' }, { status: 503 });
    }

    // Get the first 20 items directly from Square
    const { result } = await client.catalogApi.searchCatalogItems({
      limit: 20,
    });

    const targetProducts = [
      'Fire Cider',
      'Tallow Soap',
      'Whipped Tallow',
      'Goat Milk Honey Soap',
      'Hoe t shirt',
      '72% Marseille Soap Cube 300g'
    ];

    const found: any[] = [];
    
    (result.items || []).forEach((item: any, index: number) => {
      const name = item.itemData?.name || '';
      if (targetProducts.some(target => 
        name.toLowerCase().includes(target.toLowerCase()) || 
        target.toLowerCase().includes(name.toLowerCase())
      )) {
        // Get ALL fields from the item
        found.push({
          index,
          name,
          // Get all top-level fields
          topLevelFields: Object.keys(item),
          // Get all itemData fields  
          itemDataFields: Object.keys(item.itemData || {}),
          // Check for any ordering-related fields
          hasOrdinal: !!item.itemData?.categories?.[0]?.ordinal,
          hasCreatedAt: !!item.createdAt,
          hasUpdatedAt: !!item.updatedAt,
          // Get a sample of the raw structure
          sampleStructure: {
            id: item.id,
            type: item.type,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            // Check if there's a sortOrder or displayOrder field
            sortOrder: (item as any).sortOrder,
            displayOrder: (item as any).displayOrder,
            position: (item as any).position,
          }
        });
      }
    });

    return NextResponse.json({
      foundInFirst20: found,
      totalInResult: result.items?.length || 0,
      sampleFirstItem: result.items?.[0] ? {
        allFields: Object.keys(result.items[0]),
        itemDataFields: Object.keys(result.items[0].itemData || {}),
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

