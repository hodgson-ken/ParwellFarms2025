import { NextResponse } from 'next/server';
import { getSquareItems } from '@/lib/square';

export async function GET() {
  try {
    const items = await getSquareItems();
    
    // Find specific products mentioned
    const targetNames = [
      'Big sheep',
      'Follow the Rabbit Wall Art',
      'Framed Hare Rabbit Picture',
      'Framed Pear Art'
    ];
    
    const results = items
      .filter((item: any) => {
        const name = item.itemData?.name || '';
        return targetNames.some(target => name.includes(target));
      })
      .map((item: any) => ({
        id: item.id,
        name: item.itemData?.name,
        imageIds: item.itemData?.imageIds || [],
        hasImageIds: (item.itemData?.imageIds?.length || 0) > 0,
        firstImageId: item.itemData?.imageIds?.[0] || null,
      }));
    
    return NextResponse.json({
      found: results.length,
      products: results,
      note: 'Check if products have imageIds and if those IDs are valid',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

