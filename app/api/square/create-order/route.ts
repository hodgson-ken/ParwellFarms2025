import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both single item format (for product detail page) and cart format (for checkout)
    let items: Array<{ variationId: string; quantity: number }> = [];
    
    if (body.items && Array.isArray(body.items)) {
      // Cart checkout format
      items = body.items;
    } else if (body.itemVariationId && body.quantity) {
      // Single item format (backward compatible)
      items = [{ variationId: body.itemVariationId, quantity: body.quantity }];
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: either items array or itemVariationId and quantity' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    const client = getSquareClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Square credentials not configured' },
        { status: 503 }
      );
    }

    // Get location ID based on environment
    const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    const locationId = environment === 'production'
      ? (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID)
      : (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID);

    if (!locationId) {
      return NextResponse.json(
        { error: 'Square location ID not configured' },
        { status: 500 }
      );
    }

    // Create order with all items (and customer if provided)
    const customerId = body.customerId;
    const orderRequest = {
      order: {
        locationId: locationId,
        lineItems: items.map(item => ({
          quantity: item.quantity.toString(),
          catalogObjectId: item.variationId,
          catalogVersion: undefined,
        })),
        // Associate order with customer if provided
        ...(customerId && { customerId: customerId }),
      },
    };

    const { result } = await client.ordersApi.createOrder(orderRequest);

    return NextResponse.json({
      orderId: result.order?.id,
      orderVersion: result.order?.version,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

