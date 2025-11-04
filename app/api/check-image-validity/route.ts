import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageIds = searchParams.get('imageIds');
    
    if (!imageIds) {
      return NextResponse.json({ error: 'Missing imageIds parameter' }, { status: 400 });
    }

    const imageIdArray = imageIds.split(',');
    const client = getSquareClient();
    
    if (!client) {
      return NextResponse.json({ 
        error: 'Square client not initialized',
        valid: imageIdArray.map(() => false)
      }, { status: 503 });
    }

    // Check each image ID
    const validityResults = await Promise.all(
      imageIdArray.map(async (imageId: string) => {
        try {
          const { result } = await client.catalogApi.retrieveCatalogObject(imageId, false);
          const isValid = !!(result.object?.imageData?.url);
          return { imageId, isValid };
        } catch (error) {
          // Image doesn't exist or can't be retrieved
          return { imageId, isValid: false };
        }
      })
    );

    return NextResponse.json({
      results: validityResults,
    });
  } catch (error: any) {
    console.error('Error checking image validity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

