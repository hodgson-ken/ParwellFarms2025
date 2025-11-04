import { NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { getItemVariations } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({ error: 'Square client not initialized' }, { status: 503 });
    }

    const productIds = {
      showing: 'LA2XT3V7XCPBJMCXCAMHJ5IR', // Black Sheep
      missing1: 'RU72FGMHE6FBAZF6SISEBHF2', // Jesus Loves You
      missing2: '4QBNBBDIRHJ5AVZD4URZQCOX', // Raised in a Barn
    };

    const results: any = {};

    for (const [key, itemId] of Object.entries(productIds)) {
      const { result } = await client.catalogApi.retrieveCatalogObject(itemId, true);
      const item = result.object;
      
      if (item) {
        const variations = getItemVariations(item);
        results[key] = {
          name: item.itemData?.name,
          variations: variations.map((v: any) => ({
            id: v.id,
            name: v.name,
            hasPrice: !!v.price,
            price: v.price,
            sku: v.sku,
            trackInventory: v.trackInventory,
            available: v.available,
          })),
          variationsCount: variations.length,
          variationsWithPrice: variations.filter((v: any) => v.price).length,
        };
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error checking variations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check variations' },
      { status: 500 }
    );
  }
}

