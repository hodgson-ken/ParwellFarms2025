'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/square';

interface SquareCheckoutProps {
  item: any;
  variations: Array<{
    id: string;
    name: string;
    price: { amount: number; currency: string } | null;
    sku?: string;
    available: boolean;
  }>;
  disabled?: boolean;
}

export default function SquareCheckout({ item, variations, disabled = false }: SquareCheckoutProps) {
  const [selectedVariation, setSelectedVariation] = useState(variations[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const selectedVar = variations.find(v => v.id === selectedVariation) || variations[0];
  
  // Get environment variables - client components can only access NEXT_PUBLIC_ variables
  const appIdProd = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_PRODUCTION || '';
  const appIdSandbox = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_SANDBOX || '';
  const appIdGeneric = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '';
  
  const locationIdProd = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION || '';
  const locationIdSandbox = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX || '';
  const locationIdGeneric = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';
  
  // Use production if production IDs exist, otherwise use sandbox/generic
  const useProduction = (appIdProd && locationIdProd) || (!appIdSandbox && !appIdGeneric && appIdProd);
  const appId = useProduction ? appIdProd : (appIdSandbox || appIdGeneric);
  const locationId = useProduction ? locationIdProd : (locationIdSandbox || locationIdGeneric);

  useEffect(() => {
    if (!appId || !locationId) {
      console.error('Square credentials not configured', { 
        hasAppId: !!appId, 
        hasLocationId: !!locationId,
        appIdLength: appId?.length,
        locationIdLength: locationId?.length
      });
      return;
    }

    const initializeSquare = async () => {
      try {
        // Dynamically import Square Web SDK to avoid Next.js module issues
        const squareWebSdk = await import('@square/web-sdk');
        
        // The SDK exports 'payments' as a factory function, not a class
        const paymentsFactory = (squareWebSdk as any).payments;
        
        if (!paymentsFactory || typeof paymentsFactory !== 'function') {
          console.error('Square payments function not found. Available exports:', Object.keys(squareWebSdk));
          return;
        }
        
        // Call the payments factory function to get a Payments instance
        const paymentsInstance = await paymentsFactory(appId, locationId);
        
        if (!paymentsInstance) {
          console.error('Square Payments factory returned null');
          return;
        }

        setPayments(paymentsInstance);
        setSdkLoaded(true);
      } catch (error: any) {
        console.error('Error initializing Square Payments:', error);
      }
    };

    initializeSquare();
  }, [appId, locationId]);

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
      }
    };

    initializeCard();

    return () => {
      if (cardElement && typeof cardElement.detach === 'function') {
        cardElement.detach().catch((err: any) => console.error('Error detaching card:', err));
      }
    };
  }, [payments]);

  const handlePurchase = async () => {
    if (disabled) {
      alert('This item is out of stock and cannot be purchased.');
      return;
    }
    
    if (!card || !selectedVar) {
      alert('Please select a product option');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order on server
      const response = await fetch('/api/square/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemVariationId: selectedVariation,
          quantity: quantity,
        }),
      });

      const { orderId, orderVersion } = await response.json();

      if (!orderId) {
        throw new Error('Failed to create order');
      }

      // Process payment
      const result = await card.tokenize();
      
      if (result.status === 'OK') {
        // Process payment on server
        const paymentResponse = await fetch('/api/square/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: result.token,
            orderId: orderId,
            orderVersion: orderVersion,
            amount: selectedVar.price ? selectedVar.price.amount * quantity : 0,
          }),
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.success) {
          alert('Payment successful! Thank you for your purchase.');
          // Redirect or show success message
          window.location.href = '/products?success=true';
        } else {
          throw new Error(paymentResult.error || 'Payment failed');
        }
      } else {
        throw new Error(result.errors?.[0]?.detail || 'Failed to tokenize card');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message || 'Please try again'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Variation Selector */}
      {variations.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Option
          </label>
          <select
            value={selectedVariation}
            onChange={(e) => setSelectedVariation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-600 focus:border-transparent"
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>
                {variation.name} {variation.price ? `- ${formatPrice(variation.price)}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="text-lg font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Price Display */}
      {selectedVar.price && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Subtotal:</span>
            <span className="text-2xl font-bold text-farm-green">
              {formatPrice({
                amount: selectedVar.price.amount * quantity,
                currency: selectedVar.price.currency,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Information
        </label>
        {!appId || !locationId ? (
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Payment processing not configured. Please contact us to complete your purchase.
            </p>
          </div>
        ) : !sdkLoaded || !payments ? (
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              {sdkLoaded ? 'Initializing payment form...' : 'Loading payment form...'}
            </p>
          </div>
        ) : (
          <div id="card-container" className="p-4 border border-gray-300 rounded-lg bg-white"></div>
        )}
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={disabled || isProcessing || !selectedVar.available}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Purchase for ${selectedVar.price ? formatPrice({
          amount: selectedVar.price.amount * quantity,
          currency: selectedVar.price.currency,
        }) : ''}`}
      </button>

      {!selectedVar.available && (
        <p className="text-sm text-red-600 text-center">
          This option is currently unavailable
        </p>
      )}
    </div>
  );
}

