'use client';

import { useState, useEffect } from 'react';

export default function DismissibleWarning() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleDismiss = () => {
    setIsFadingOut(true);
    // Remove from DOM after fade animation completes
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Match transition duration
  };

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Remove from DOM after fade animation completes
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 max-w-3xl w-full mx-4 shadow-lg transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Close warning"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <p className="text-sm text-gray-800 font-medium pr-6">
        <strong>⚠️ Note:</strong> These are placeholder products for development purposes. 
        Real products will be loaded from Square once integration is configured.
      </p>
    </div>
  );
}

