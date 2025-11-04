import { NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { getSquareItems } from '@/lib/square';

export async function GET() {
  try {
    const allItems = await getSquareItems();
    
    const apparelItems = allItems.filter((item: any) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      return name.includes('shirt') || name.includes('sweatshirt') || 
             name.includes('black sheep') || name.includes('campfire') ||
             name.includes('grow a pear') || name.includes('hoe') ||
             name.includes('make biscuits') || name.includes('vintage') ||
             name.includes('jesus') || name.includes('raised in a barn') ||
             name.includes('boo heifer') || name.includes('wake the lion');
    });

    const results = apparelItems.map((item: any) => ({
      id: item.id,
      name: item.itemData?.name,
      hasImageIds: !!(item.itemData?.imageIds && item.itemData.imageIds.length > 0),
      channels: item.channels || [],
      presentAtAllLocations: item.presentAtAllLocations,
      presentAtLocationIds: item.presentAtLocationIds || [],
      hasVariationsWithSku: item.itemData?.variations?.some((v: any) => v.itemVariationData?.sku) || false,
      variationsWithSkuCount: item.itemData?.variations?.filter((v: any) => v.itemVariationData?.sku).length || 0,
      totalVariations: item.itemData?.variations?.length || 0,
    }));

    return NextResponse.json({
      apparelCount: apparelItems.length,
      items: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

