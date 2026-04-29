'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  itemId: string;
  variationId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (variationId: string) => void;
  updateQuantity: (variationId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount (only on client side)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem('parwell-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes (only on client side)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('parwell-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    console.log('[CartContext] addToCart called:', item);
    try {
      setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.variationId === item.variationId);
        
        if (existingItem) {
          // Update quantity if item already exists
          const updated = prevCart.map((i) =>
            i.variationId === item.variationId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
          console.log('[CartContext] Updated existing item, new cart:', updated);
          return updated;
        } else {
          // Add new item
          const updated = [...prevCart, item];
          console.log('[CartContext] Added new item, new cart:', updated);
          return updated;
        }
      });
    } catch (error) {
      console.error('[CartContext] Error adding to cart:', error);
    }
  };

  const removeFromCart = (variationId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.variationId !== variationId));
  };

  const updateQuantity = (variationId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variationId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) =>
        i.variationId === variationId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('parwell-cart');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

