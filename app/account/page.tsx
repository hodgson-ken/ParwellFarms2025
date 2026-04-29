'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { cartCount } = useCart();

  // Note: We don't store customer in localStorage - everything comes from Square API
  // Check for phone number in URL params or session (for after checkout)
  useEffect(() => {
    // Try to get customer ID from URL params (if redirected from checkout)
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get('customerId');
    
    if (customerId) {
      // Fetch customer from Square API
      loadCustomerById(customerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCustomerById = async (customerId: string) => {
    try {
      const response = await fetch(`/api/square/customers?id=${customerId}`);
      const data = await response.json();
      
      if (data.customer) {
        setCustomer(data.customer);
        setIsLoggedIn(true);
        setPhoneNumber(data.customer.phoneNumber || '');
        
        // Load orders for the customer
        loadOrders(data.customer.id);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  const loadOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`/api/square/orders?customerId=${customerId}`);
      const data = await response.json();
      
      if (response.status === 429) {
        // Rate limited
        const retryAfter = data.retryAfter || 60;
        alert(`Too many requests. Please wait ${retryAfter} seconds and try again.`);
        console.error('Rate limited when loading orders:', data);
        return;
      }
      
      if (data.orders) {
        setOrders(data.orders);
      } else if (data.error) {
        console.error('Error loading orders:', data.error);
        alert(`Error loading orders: ${data.error}`);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Failed to load orders. Please try again.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Search for or create customer by phone number (Square database only)
      const response = await fetch('/api/square/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        const retryAfter = data.retryAfter || 60;
        alert(`Too many requests. Please wait ${retryAfter} seconds and try again.`);
        console.error('Rate limited when logging in:', data);
        setLoading(false);
        return;
      }

      if (data.customer) {
        setCustomer(data.customer);
        setIsLoggedIn(true);
        // Don't store in localStorage - everything comes from Square API
        
        // Load orders for the customer
        if (data.customer.id) {
          loadOrders(data.customer.id);
        }
      } else {
        alert('Error: ' + (data.error || 'Failed to login'));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCustomer(null);
    setIsLoggedIn(false);
    setPhoneNumber('');
    // Clear any URL params
    window.history.replaceState({}, '', '/account');
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-farm-green mb-8 text-center">
          My Account
        </h1>

        {isLoggedIn ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-farm-green mb-4">
                Account Information
              </h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Phone:</span> {customer.phoneNumber || phoneNumber}</p>
                {customer.emailAddress ? (
                  <p><span className="font-semibold">Email:</span> {customer.emailAddress}</p>
                ) : null}
                {customer.givenName || customer.familyName ? (
                  <p>
                    <span className="font-semibold">Name:</span>{' '}
                    {[customer.givenName, customer.familyName].filter(Boolean).join(' ') || 'Not set'}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-farm-green mb-4">
                Order History
              </h2>
              {loadingOrders ? (
                <p className="text-gray-600">Loading orders...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-farm-green">
                            {order.totalMoney 
                              ? `$${(order.totalMoney.amount / 100).toFixed(2)}`
                              : 'Amount unavailable'
                            }
                          </p>
                          <p className="text-sm text-gray-600 capitalize">{order.state || 'Unknown'}</p>
                        </div>
                      </div>
                      {order.lineItems && order.lineItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {order.lineItems.map((item: any, idx: number) => (
                              <li key={idx}>
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Your order history will appear here once you place your first order.
                </p>
              )}
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-serif font-bold text-farm-green mb-6">
              Sign In or Create Account
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your phone number to access your account or create a new one.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-600 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In / Create Account'}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4">
              We&apos;ll create an account for you if one doesn&apos;t exist.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

