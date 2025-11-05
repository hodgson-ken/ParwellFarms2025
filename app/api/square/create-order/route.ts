import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

// Validate variation ID format (Square format: alphanumeric, typically 13 chars)
function isValidVariationId(id: string): boolean {
  return /^[A-Z0-9]{13}$/.test(id);
}

// Validate Square IDs format (reusable)
function isValidSquareId(id: string): boolean {
  return /^[A-Z0-9]{13}$/.test(id);
}

// Validate quantity
function isValidQuantity(qty: number): boolean {
  return Number.isInteger(qty) && qty > 0 && qty <= 100; // Reasonable max
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both single item format (for product detail page) and cart format (for checkout)
    let items: Array<{ variationId: string; quantity: number }> = [];
    
    if (body.items && Array.isArray(body.items)) {
      // Cart checkout format - validate each item
      items = body.items.filter((item: any) => {
        if (!item.variationId || !isValidVariationId(item.variationId)) {
          console.warn(`Invalid variation ID: ${item.variationId}`);
          return false;
        }
        if (!isValidQuantity(item.quantity)) {
          console.warn(`Invalid quantity: ${item.quantity}`);
          return false;
        }
        return true;
      });
    } else if (body.itemVariationId && body.quantity) {
      // Single item format (backward compatible) - validate
      if (!isValidVariationId(body.itemVariationId)) {
        return NextResponse.json(
          { error: 'Invalid variation ID format' },
          { status: 400 }
        );
      }
      if (!isValidQuantity(body.quantity)) {
        return NextResponse.json(
          { error: 'Invalid quantity (must be 1-100)' },
          { status: 400 }
        );
      }
      items = [{ variationId: body.itemVariationId, quantity: body.quantity }];
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: either items array or itemVariationId and quantity' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No valid items in order' },
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
    
    // Validate customer ID if provided
    if (customerId && !isValidSquareId(customerId)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

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
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}

