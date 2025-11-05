'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
  id: string;
  itemData?: {
    name?: string;
    imageIds?: string[];
  };
}

interface SearchContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <SearchContext.Provider value={{ products, setProducts }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

