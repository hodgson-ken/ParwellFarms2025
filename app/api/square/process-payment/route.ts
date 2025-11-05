import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

// Validate Square IDs format
function isValidSquareId(id: string): boolean {
  return /^[A-Z0-9]{13}$/.test(id);
}

// Validate amount (in cents)
function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= 10000000; // Max $100,000
}

export async function POST(request: NextRequest) {
  try {
    const { sourceId, orderId, orderVersion, amount } = await request.json();

    if (!sourceId || !orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate input formats
    if (!isValidSquareId(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    if (!isValidAmount(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Source ID is a token from Square SDK, validate it's a string
    if (typeof sourceId !== 'string' || sourceId.length < 10) {
      return NextResponse.json(
        { error: 'Invalid payment source' },
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

    // Create payment
    const paymentRequest = {
      sourceId: sourceId,
      orderId: orderId,
      idempotencyKey: `${orderId}-${Date.now()}`,
      amountMoney: {
        amount: amount,
        currency: 'USD',
      },
    };

    const { result } = await client.paymentsApi.createPayment(paymentRequest);

    if (result.payment?.status === 'APPROVED' || result.payment?.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        paymentId: result.payment?.id,
        orderId: orderId,
        amount: amount,
        status: result.payment?.status,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.payment?.status || 'Payment not approved',
          status: result.payment?.status,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing payment:', error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { success: false, error: 'Payment processing failed. Please try again.' },
      { status: 500 }
    );
  }
}

