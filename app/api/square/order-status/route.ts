import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: 'Please provide either orderId or paymentId' },
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

    let order = null;
    let payment = null;

    // Fetch order if orderId provided
    if (orderId) {
      try {
        const { result } = await client.ordersApi.retrieveOrder(orderId);
        order = {
          id: result.order?.id,
          state: result.order?.state,
          totalMoney: result.order?.totalMoney,
          lineItems: result.order?.lineItems?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            totalMoney: item.totalMoney,
          })),
        };
      } catch (err: any) {
        console.error('Error fetching order:', err);
      }
    }

    // Fetch payment if paymentId provided
    if (paymentId) {
      try {
        const { result } = await client.paymentsApi.getPayment(paymentId);
        payment = {
          id: result.payment?.id,
          status: result.payment?.status,
          amountMoney: result.payment?.amountMoney,
          orderId: result.payment?.orderId,
        };
      } catch (err: any) {
        console.error('Error fetching payment:', err);
      }
    }

    return NextResponse.json({
      order,
      payment,
      found: !!(order || payment),
    });
  } catch (error: any) {
    console.error('Error checking order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check order status' },
      { status: 500 }
    );
  }
}

