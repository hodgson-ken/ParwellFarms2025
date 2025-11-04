import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { writeFile, readFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'public', 'cached-images');

// Helper to check if cached image exists and get its path
function getCachedImagePath(imageId: string): string | null {
  const cachePath = path.join(CACHE_DIR, `${imageId}.jpg`);
  try {
    if (existsSync(cachePath)) {
      return cachePath;
    }
  } catch {
    // Cache file doesn't exist
  }
  return null;
}

// Helper to download and cache image
async function cacheImage(imageId: string, imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const cachePath = path.join(CACHE_DIR, `${imageId}.jpg`);
    await writeFile(cachePath, buffer);
    
    return cachePath;
  } catch (error) {
    console.error(`Error caching image ${imageId}:`, error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const imageId = params.id;
  
  try {
    // First, check if we have a cached version
    const cachedImagePath = getCachedImagePath(imageId);
    if (cachedImagePath) {
      // Serve cached image directly (no redirect) to avoid protocol issues
      const imageBuffer = readFileSync(cachedImagePath);
      
      console.log(`[ImageAPI] Serving cached image: ${imageId} (${imageBuffer.length} bytes)`);
      
      const response = new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
      
      // In background, check if image needs updating (fire and forget)
      setImmediate(async () => {
        try {
          const client = getSquareClient();
          if (client) {
            const { result } = await client.catalogApi.retrieveCatalogObject(imageId, false);
            if (result.object?.imageData?.url) {
              // Image URL might have changed, update cache
              await cacheImage(imageId, result.object.imageData.url);
            }
          }
        } catch (error) {
          // Silently fail background update
        }
      });
      
      return response;
    }
    
    // No cache exists, fetch from Square
    console.log(`[ImageAPI] Cache miss for image: ${imageId}, fetching from Square`);
    const client = getSquareClient();
    if (!client) {
      console.warn(`[ImageAPI] Square client not available for image: ${imageId}, returning placeholder`);
      // Return placeholder image in preview mode
      const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-product.jpg');
      if (existsSync(placeholderPath)) {
        const placeholderBuffer = readFileSync(placeholderPath);
        return new NextResponse(placeholderBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const { result } = await client.catalogApi.retrieveCatalogObject(imageId, false);
    
    if (result.object?.imageData?.url) {
      console.log(`[ImageAPI] Retrieved image URL from Square for ${imageId}: ${result.object.imageData.url.substring(0, 50)}...`);
      // Cache the image for future requests
      try {
        const cachedImagePath = await cacheImage(imageId, result.object.imageData.url);
        // Serve cached version directly
        const imageBuffer = readFileSync(cachedImagePath);
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (cacheError) {
        // If caching fails, fetch from Square and serve directly (proxy through our server)
        console.warn(`[ImageAPI] Cache failed for ${imageId}, proxying from Square:`, {
          imageId: imageId,
          error: cacheError instanceof Error ? cacheError.message : String(cacheError),
          timestamp: new Date().toISOString(),
        });
        try {
          const imageResponse = await fetch(result.object.imageData.url);
          if (imageResponse.ok) {
            const arrayBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(`[ImageAPI] Successfully proxied image ${imageId} (${buffer.length} bytes)`);
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
              },
            });
          } else {
            console.error(`[ImageAPI] Failed to fetch image from Square URL for ${imageId}:`, {
              status: imageResponse.status,
              statusText: imageResponse.statusText,
              url: result.object.imageData.url.substring(0, 50),
            });
          }
        } catch (fetchError) {
          console.error(`[ImageAPI] Failed to proxy image ${imageId}:`, {
            imageId: imageId,
            error: fetchError instanceof Error ? fetchError.message : String(fetchError),
            url: result.object.imageData.url.substring(0, 50),
            timestamp: new Date().toISOString(),
          });
        }
      }
    } else {
      console.warn(`[ImageAPI] No image data URL found for ${imageId}`, {
        imageId: imageId,
        hasObject: !!result.object,
        hasImageData: !!result.object?.imageData,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Return placeholder if no image found
    console.log(`[ImageAPI] Returning placeholder for image ${imageId}`);
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-product.jpg');
    if (existsSync(placeholderPath)) {
      const placeholderBuffer = readFileSync(placeholderPath);
      return new NextResponse(placeholderBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    return new NextResponse('Image not found', { status: 404 });
  } catch (error) {
    console.error(`[ImageAPI] Error fetching Square image ${imageId}:`, {
      imageId: imageId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
    // Return placeholder image on error
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-product.jpg');
    if (existsSync(placeholderPath)) {
      const placeholderBuffer = readFileSync(placeholderPath);
      return new NextResponse(placeholderBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    return new NextResponse('Image not found', { status: 404 });
  }
}
