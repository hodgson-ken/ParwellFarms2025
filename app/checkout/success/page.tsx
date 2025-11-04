'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/square';

interface OrderInfo {
  orderId?: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  timestamp?: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  useEffect(() => {
    // Try to get order info from URL params or sessionStorage
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    
    if (orderId || paymentId) {
      setOrderInfo({
        orderId: orderId || undefined,
        paymentId: paymentId || undefined,
      });
    } else {
      // Try to get from sessionStorage
      const storedOrder = sessionStorage.getItem('lastOrder');
      if (storedOrder) {
        try {
          setOrderInfo(JSON.parse(storedOrder));
          // Clear after reading
          sessionStorage.removeItem('lastOrder');
        } catch (e) {
          console.error('Error parsing stored order:', e);
        }
      }
    }
  }, [searchParams]);

  return (
    <div className="py-12 bg-farm-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-4">
              Order Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your purchase. Your order has been processed and you will receive a confirmation email shortly.
            </p>
            
            {/* Order Details */}
            {orderInfo && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                <h2 className="text-lg font-[var(--font-libre-franklin)] font-semibold text-gray-900 mb-4">
                  Order Details
                </h2>
                <div className="space-y-2 text-sm">
                  {orderInfo.orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-gray-900">{orderInfo.orderId}</span>
                    </div>
                  )}
                  {orderInfo.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-gray-900">{orderInfo.paymentId}</span>
                    </div>
                  )}
                  {orderInfo.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-farm-green">
                        {formatPrice({ amount: orderInfo.amount, currency: 'USD' })}
                      </span>
                    </div>
                  )}
                  {orderInfo.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600 capitalize">{orderInfo.status}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                Continue Shopping
              </Link>
              <Link href="/account" className="btn-secondary">
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

