'use client';

import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/square';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appId, setAppId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [configLoaded, setConfigLoaded] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Fetch Square configuration from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/square/config');
        const config = await response.json();
        
        if (config.hasCredentials && config.appId && config.locationId) {
          setAppId(config.appId);
          setLocationId(config.locationId);
          setConfigLoaded(true);
          console.log('Square config loaded:', { 
            environment: config.environment,
            hasAppId: !!config.appId,
            hasLocationId: !!config.locationId,
            debug: config.debug
          });
        } else {
          console.error('Square config missing:', config);
          const missing = [];
          if (!config.appId || config.appId.includes('your_')) missing.push('Application ID');
          if (!config.locationId || config.locationId.includes('your_')) missing.push('Location ID');
          setError(`Square payment credentials not configured. Missing: ${missing.join(', ')}. Please update your .env.local file.`);
          setConfigLoaded(true);
        }
      } catch (err: any) {
        console.error('Error fetching Square config:', err);
        setError('Failed to load payment configuration');
        setConfigLoaded(true);
      }
    };
    
    fetchConfig();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Note: We don't use localStorage for customer - everything comes from Square API
  // Customer is identified by phone number only (matches original site)

  // Initialize Square Payments
  useEffect(() => {
    if (!configLoaded) return; // Wait for config to load
    
    if (!appId || !locationId) {
      console.error('Square credentials not configured', { 
        hasAppId: !!appId, 
        hasLocationId: !!locationId,
        appIdLength: appId?.length,
        locationIdLength: locationId?.length,
        configLoaded
      });
      setError('Payment credentials not configured. Please contact support.');
      return;
    }

    const initializeSquare = async () => {
      try {
        console.log('Loading Square Web SDK...');
        
        // Dynamically import Square Web SDK to avoid Next.js module issues
        const squareWebSdk = await import('@square/web-sdk');
        
        // The SDK exports 'payments' as a factory function, not a class
        const paymentsFactory = (squareWebSdk as any).payments;
        
        if (!paymentsFactory || typeof paymentsFactory !== 'function') {
          const sdkExports = Object.keys(squareWebSdk);
          throw new Error(`Square payments function not found. Available exports: ${sdkExports.join(', ')}`);
        }
        
        console.log('Initializing Square Payments with:', { 
          appIdLength: appId.length, 
          locationIdLength: locationId.length 
        });
        
        // Call the payments factory function to get a Payments instance
        const paymentsInstance = await paymentsFactory(appId, locationId);
        
        if (!paymentsInstance) {
          throw new Error('Square Payments factory returned null');
        }
        
        setPayments(paymentsInstance);
        setSdkLoaded(true);
        setError(null); // Clear any previous errors
        console.log('Square Payments initialized successfully');
      } catch (error: any) {
        console.error('Error initializing Square Payments:', error);
        setError(`Failed to initialize payment system: ${error?.message || 'Unknown error'}`);
      }
    };

    initializeSquare();
  }, [appId, locationId, configLoaded]);

  // Mount card element
  useEffect(() => {
    if (!payments) return;

    let cardElement: any = null;

    const initializeCard = async () => {
      try {
        // card() returns a promise in newer SDK versions
        cardElement = await payments.card();
        
        // Use attach instead of mount in newer SDK versions
        await cardElement.attach('#card-container');
        
        setCard(cardElement);
      } catch (error: any) {
        console.error('Error mounting card element:', error);
        setError(`Failed to initialize card form: ${error?.message || 'Unknown error'}`);
      }
    };

    initializeCard();

    return () => {
      if (cardElement && typeof cardElement.detach === 'function') {
        cardElement.detach().catch((err: any) => console.error('Error detaching card:', err));
      }
    };
  }, [payments]);

  const handleCheckout = async () => {
    if (!card || cart.length === 0) {
      setError('Please ensure payment information is loaded');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // If phone number provided, get or create customer in Square database
      let finalCustomerId = customerId;
      if (phoneNumber && !finalCustomerId) {
        try {
          const customerResponse = await fetch('/api/square/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber }),
          });
          const customerData = await customerResponse.json();
          if (customerData.customer) {
            finalCustomerId = customerData.customer.id;
            // Don't store in localStorage - always fetch from Square API
          }
        } catch (err) {
          console.warn('Could not create customer, proceeding without customer association:', err);
        }
      }

      // Create order with all cart items (and customer if available)
      const orderResponse = await fetch('/api/square/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            variationId: item.variationId,
            quantity: item.quantity,
          })),
          customerId: finalCustomerId || undefined, // Associate order with customer if available
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.orderId) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Tokenize card
      const tokenResult = await card.tokenize();
      
      if (tokenResult.status !== 'OK') {
        throw new Error(tokenResult.errors?.[0]?.detail || 'Failed to process card');
      }

      // Process payment
      const paymentResponse = await fetch('/api/square/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          orderId: orderData.orderId,
          orderVersion: orderData.orderVersion,
          amount: cartTotal,
        }),
      });

      const paymentResult = await paymentResponse.json();

      console.log('Payment result:', paymentResult);

      if (!paymentResult.success) {
        console.error('Payment failed:', {
          error: paymentResult.error,
          status: paymentResult.status,
          orderId: orderData.orderId,
        });
        throw new Error(paymentResult.error || `Payment failed with status: ${paymentResult.status || 'unknown'}`);
      }

      // Payment was successful - log for verification
      console.log('Payment successful:', {
        orderId: orderData.orderId,
        paymentId: paymentResult.paymentId,
        amount: cartTotal,
        status: paymentResult.status,
      });

      // Store order info before clearing cart (temporary session data only)
      const orderInfo = {
        orderId: orderData.orderId,
        paymentId: paymentResult.paymentId,
        amount: cartTotal,
        status: paymentResult.status,
        customerId: finalCustomerId || undefined,
        timestamp: new Date().toISOString(),
      };

      // Store in sessionStorage for success page to display (temporary session data)
      sessionStorage.setItem('lastOrder', JSON.stringify(orderInfo));

      // Clear cart only after successful payment confirmation
      clearCart();
      
      // Redirect to success page with order info and customer ID (if available)
      const successParams = new URLSearchParams({
        orderId: orderData.orderId,
        paymentId: paymentResult.paymentId,
      });
      if (finalCustomerId) {
        successParams.set('customerId', finalCustomerId);
      }
      router.push(`/checkout/success?${successParams.toString()}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="py-12 bg-farm-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              {/* Customer Information (Optional) */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-4">
                  Customer Information
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your phone number to link this order to your account and view order history later.
                </p>
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="checkout-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-600 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We&apos;ll create an account for you if one doesn&apos;t exist.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.variationId} className="flex items-center gap-4 pb-4 border-b">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatPrice({ amount: item.price, currency: 'USD' })}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {formatPrice({ amount: item.price * item.quantity, currency: 'USD' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-[var(--font-libre-franklin)] font-bold text-gray-900 mb-6">
                  Payment
                </h2>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold">{formatPrice({ amount: cartTotal, currency: 'USD' })}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Shipping</span>
                    <span className="text-sm text-gray-600">Calculated after checkout</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-farm-green">
                      {formatPrice({ amount: cartTotal, currency: 'USD' })}
                    </span>
                  </div>
                </div>

                {/* Payment Form */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {!configLoaded ? (
                  <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                      Loading payment configuration...
                    </p>
                  </div>
                ) : !appId || !locationId ? (
                  <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                      Payment processing not configured. Please contact us to complete your purchase.
                    </p>
                  </div>
                ) : !sdkLoaded || !payments ? (
                  <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                      {sdkLoaded ? 'Initializing payment form...' : 'Loading payment form...'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Information
                      </label>
                      <div id="card-container" className="p-4 border border-gray-300 rounded-lg bg-white"></div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : `Complete Order - ${formatPrice({ amount: cartTotal, currency: 'USD' })}`}
                    </button>
                  </>
                )}

                <Link href="/cart" className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4">
                  ← Return to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

