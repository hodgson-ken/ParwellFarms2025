import { NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { getSquareItems } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({ error: 'Square client not initialized' }, { status: 503 });
    }

    const allItems = await getSquareItems();
    
    // Product names to compare
    const showingProducts = [
      'black sheep',
      'campfire',
      'grow a pear',
      'hoe t shirt',
      'make biscuits cat tshirt',
      'vintage state of mind'
    ];
    
    const missingProducts = [
      'jesus loves you',
      'raised in a barn'
    ];

    const foundShowing: any[] = [];
    const foundMissing: any[] = [];

    // Find products that ARE showing
    allItems.forEach((item: any) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      if (showingProducts.some(prod => name.includes(prod.toLowerCase()))) {
        foundShowing.push({
          id: item.id,
          name: item.itemData?.name,
          hasImageIds: !!(item.itemData?.imageIds && item.itemData.imageIds.length > 0),
          imageIdsCount: item.itemData?.imageIds?.length || 0,
          isArchived: item.itemData?.isArchived || false,
          hasVariations: !!(item.itemData?.variations && item.itemData.variations.length > 0),
          variationsCount: item.itemData?.variations?.length || 0,
          hasCategories: !!(item.itemData?.categories && item.itemData.categories.length > 0),
          categories: item.itemData?.categories?.map((c: any) => c.name || c.id) || [],
          presentAtAllLocations: item.presentAtAllLocations,
          presentAtLocationIds: item.presentAtLocationIds || [],
          absentAtLocationIds: item.absentAtLocationIds || [],
          channels: item.channels || [],
        });
      }
    });

    // Find products that are NOT showing
    allItems.forEach((item: any) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      if (missingProducts.some(prod => name.includes(prod.toLowerCase()))) {
        foundMissing.push({
          id: item.id,
          name: item.itemData?.name,
          hasImageIds: !!(item.itemData?.imageIds && item.itemData.imageIds.length > 0),
          imageIdsCount: item.itemData?.imageIds?.length || 0,
          isArchived: item.itemData?.isArchived || false,
          hasVariations: !!(item.itemData?.variations && item.itemData.variations.length > 0),
          variationsCount: item.itemData?.variations?.length || 0,
          hasCategories: !!(item.itemData?.categories && item.itemData.categories.length > 0),
          categories: item.itemData?.categories?.map((c: any) => c.name || c.id) || [],
          presentAtAllLocations: item.presentAtAllLocations,
          presentAtLocationIds: item.presentAtLocationIds || [],
          absentAtLocationIds: item.absentAtLocationIds || [],
          channels: item.channels || [],
        });
      }
    });

    // Get all apparel products
    const apparelItems = allItems.filter((item: any) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      const desc = item.itemData?.description?.toLowerCase() || '';
      const categories = item.itemData?.categories?.map((c: any) => c.name?.toLowerCase() || '') || [];
      
      return name.includes('shirt') || name.includes('apparel') || 
             desc.includes('apparel') || 
             categories.some((c: string) => c.includes('apparel'));
    });

    const apparelWithImages = apparelItems.filter((item: any) => {
      return item.itemData?.imageIds && item.itemData.imageIds.length > 0;
    });

    return NextResponse.json({
      summary: {
        totalItems: allItems.length,
        apparelItemsTotal: apparelItems.length,
        apparelWithImages: apparelWithImages.length,
      },
      showingProducts: {
        count: foundShowing.length,
        products: foundShowing,
      },
      missingProducts: {
        count: foundMissing.length,
        products: foundMissing,
      },
      allApparelProducts: apparelItems.map((item: any) => ({
        id: item.id,
        name: item.itemData?.name,
        hasImageIds: !!(item.itemData?.imageIds && item.itemData.imageIds.length > 0),
        imageIdsCount: item.itemData?.imageIds?.length || 0,
        isArchived: item.itemData?.isArchived || false,
      })),
    });
  } catch (error: any) {
    console.error('Error inspecting apparel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to inspect apparel products' },
      { status: 500 }
    );
  }
}

