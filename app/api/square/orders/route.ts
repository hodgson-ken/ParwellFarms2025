import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

// Helper to clean order data for JSON serialization
function cleanOrderData(order: any): any {
  if (!order) return null;
  
  return {
    id: order.id,
    locationId: order.locationId,
    lineItems: order.lineItems?.map((item: any) => ({
      uid: item.uid,
      name: item.name,
      quantity: item.quantity,
      itemType: item.itemType,
      // Clean price money
      basePriceMoney: item.basePriceMoney ? {
        amount: typeof item.basePriceMoney.amount === 'bigint'
          ? Number(item.basePriceMoney.amount)
          : item.basePriceMoney.amount,
        currency: item.basePriceMoney.currency,
      } : null,
      totalMoney: item.totalMoney ? {
        amount: typeof item.totalMoney.amount === 'bigint'
          ? Number(item.totalMoney.amount)
          : item.totalMoney.amount,
        currency: item.totalMoney.currency,
      } : null,
    })) || [],
    totalMoney: order.totalMoney ? {
      amount: typeof order.totalMoney.amount === 'bigint'
        ? Number(order.totalMoney.amount)
        : order.totalMoney.amount,
      currency: order.totalMoney.currency,
    } : null,
    state: order.state,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    version: typeof order.version === 'bigint' ? Number(order.version) : order.version,
  };
}

// Validate Square IDs format - customer IDs can vary in length
function isValidSquareId(id: string): boolean {
  // Square IDs are alphanumeric, typically 13-20 characters
  // Be more lenient for customer IDs which can vary
  return /^[A-Z0-9]{10,30}$/.test(id);
}

// Get orders for a customer
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Validate customer ID format
    if (!isValidSquareId(customerId)) {
      console.error('[orders] Invalid customer ID format:', {
        customerId,
        length: customerId.length,
        pattern: /^[A-Z0-9]{10,30}$/.test(customerId),
      });
      return NextResponse.json(
        { error: `Invalid customer ID format. Received: ${customerId.substring(0, 20)}... (length: ${customerId.length})` },
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

    // Search for orders by customer
    const { result } = await client.ordersApi.searchOrders({
      locationIds: [locationId],
      query: {
        filter: {
          customerFilter: {
            customerIds: [customerId],
          },
        },
        sort: {
          sortField: 'CREATED_AT',
          sortOrder: 'DESC',
        },
      },
      limit: 50,
    });

    const orders = (result.orders || []).map(cleanOrderData);

    return NextResponse.json({
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to fetch orders. Please try again.' },
      { status: 500 }
    );
  }
}

