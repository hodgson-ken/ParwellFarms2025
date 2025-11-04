import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, getSquareItems } from '@/lib/square';

export async function GET(request: NextRequest) {
  // Allow testing different environments via query param
  const searchParams = request.nextUrl.searchParams;
  const testEnvironment = searchParams.get('env'); // 'production' or 'sandbox'
  try {
    const client = getSquareClient();
    
    if (!client) {
      return NextResponse.json({
        error: 'Square client not initialized',
        reason: 'SQUARE_ACCESS_TOKEN not set or invalid',
        env: {
          hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
          hasAppId: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
          hasLocationId: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
          environment: process.env.SQUARE_ENVIRONMENT,
        }
      }, { status: 503 });
    }

    const items = await getSquareItems();
    
    // Also try a direct catalog search to see raw response
    let rawResponse = null;
    try {
      const { result } = await client.catalogApi.searchCatalogItems({
        limit: 100,
      });
      rawResponse = {
        itemsCount: result.items?.length || 0,
        objectTypes: result.items?.map((item: any) => item.type),
        firstItem: result.items?.[0] ? {
          id: result.items[0].id,
          type: result.items[0].type,
          name: (result.items[0] as any).itemData?.name || (result.items[0] as any).categoryData?.name,
        } : null,
      };
    } catch (e: any) {
      rawResponse = { error: e.message };
    }
    
    return NextResponse.json({
      success: true,
      clientInitialized: true,
      itemsCount: items.length,
      items: items.slice(0, 3).map((item: any) => ({
        id: item.id,
        name: item.itemData?.name,
        type: item.type,
      })),
      rawSearchResult: rawResponse,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

