'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';
import CartPreview from '@/components/CartPreview';
import SearchModal from '@/components/SearchModal';

export default function Navigation() {
  const { cartCount } = useCart();
  const { products } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll position for mobile - show compact header when scrolled away from top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show compact header when scrolled away from top (more than 50px)
      if (currentScrollY > 50) {
        setIsScrolledUp(true);
      } else {
        setIsScrolledUp(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Desktop Layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logos/PWF WEB HEADER.webp" 
              alt="Parwell Farms" 
              width={200}
              height={64}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-lavender-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-lavender-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-lavender-600 transition-colors">
              Contact
            </Link>
          </div>

          {/* Search, Account, and Cart Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-700 hover:text-lavender-600 transition-colors"
              aria-label="Search products"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account Icon */}
            <Link 
              href="/account" 
              className="text-gray-700 hover:text-lavender-600 transition-colors"
              aria-label="Account"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Cart Icon with Hover Preview */}
            <div className="relative group">
              <Link 
                href="/cart" 
                className="relative text-gray-700 hover:text-lavender-600 transition-colors"
                aria-label="Shopping cart"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-lavender-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              {/* Hover Preview - Shows bag with contents */}
              {cartCount > 0 && (
                <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <CartPreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {!isScrolledUp ? (
          /* Original Layout - At top of page */
          <>
            {/* Full Width Logo */}
            <div className="w-full py-4 px-4 transition-all duration-300">
              <Link href="/" className="flex items-center justify-center w-full">
                <Image 
                  src="/logos/PWF WEB HEADER.webp" 
                  alt="Parwell Farms" 
                  width={200}
                  height={64}
                  className="h-16 w-auto max-w-full object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Links and Icons */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pb-3 border-b border-gray-200 transition-all duration-300">
              {/* About and Contact Links */}
              <div className="flex items-center space-x-6">
                <Link href="/about" className="text-gray-700 hover:text-lavender-600 transition-colors text-sm font-medium">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-lavender-600 transition-colors text-sm font-medium">
                  Contact
                </Link>
              </div>

              {/* Search, Account, and Cart Icons - Right Justified */}
              <div className="flex items-center space-x-6">
                {/* Search Icon */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-700 hover:text-lavender-600 transition-colors"
                  aria-label="Search products"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Account Icon */}
                <Link 
                  href="/account" 
                  className="text-gray-700 hover:text-lavender-600 transition-colors"
                  aria-label="Account"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>

                {/* Cart Icon */}
                <div className="relative">
                  <Link 
                    href="/cart" 
                    className="relative text-gray-700 hover:text-lavender-600 transition-colors"
                    aria-label="Shopping cart"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-lavender-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Compact Layout - Scrolled away from top */
          <div className="max-w-7xl mx-auto px-4 transition-all duration-300 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* Hamburger Menu - Left */}
              <div className="relative">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-lavender-600 transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40 bg-black bg-opacity-25"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* Menu */}
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2">
                      <Link
                        href="/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-lavender-600 transition-colors"
                      >
                        About
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-lavender-600 transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Logo - Center, smaller */}
              <Link 
                href="/" 
                className="flex items-center justify-center h-8 transition-all duration-300"
              >
                <Image 
                  src="/logos/PWF WEB HEADER.webp" 
                  alt="Parwell Farms" 
                  width={200}
                  height={64}
                  className="h-8 w-auto max-w-[120px] object-contain transition-all duration-300"
                  priority
                />
              </Link>

              {/* Search, Account, and Cart Icons - Right */}
              <div className="flex items-center space-x-4">
                {/* Search Icon */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-700 hover:text-lavender-600 transition-colors"
                  aria-label="Search products"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Account Icon */}
                <Link 
                  href="/account" 
                  className="text-gray-700 hover:text-lavender-600 transition-colors"
                  aria-label="Account"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>

                {/* Cart Icon */}
                <div className="relative">
                  <Link 
                    href="/cart" 
                    className="relative text-gray-700 hover:text-lavender-600 transition-colors"
                    aria-label="Shopping cart"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-lavender-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
      />
    </nav>
  );
}

