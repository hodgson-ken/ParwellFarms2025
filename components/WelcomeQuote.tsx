'use client';

import { useState, useEffect } from 'react';

interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: "In the Spring at the end of the day you should smell like dirt.",
    author: "Victoria"
  },
  {
    text: "To the world you may be one person, but to one person you may be the world.",
    author: "Victoria"
  },
  {
    text: "Are you a smart feller or a fart smeller.",
    author: "Mike"
  },
];

const STORAGE_KEY = 'welcome-quote-index';

export default function WelcomeQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Get the last quote index from localStorage, or start at 0
    const lastIndex = typeof window !== 'undefined' 
      ? parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
      : 0;
    
    // Cycle to the next quote
    const nextIndex = (lastIndex + 1) % quotes.length;
    
    // Save the new index for the next refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    }
    
    // Set the quote to display
    setQuote(quotes[nextIndex]);
  }, []);

  if (!quote) {
    return null; // Don't render anything until quote is selected
  }

  return (
    <div className="mb-12 text-center">
      <blockquote className="max-w-3xl mx-auto">
        <p className="text-lg md:text-xl italic text-gray-700 mb-2">
          &quot;{quote.text}&quot;
        </p>
        <p className="text-gray-600 text-right font-serif text-sm">
          — {quote.author}
        </p>
      </blockquote>
    </div>
  );
}

