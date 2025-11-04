import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    const { sourceId, orderId, orderVersion, amount } = await request.json();

    if (!sourceId || !orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    return NextResponse.json(
      { success: false, error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}

