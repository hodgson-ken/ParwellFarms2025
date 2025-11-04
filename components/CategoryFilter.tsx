'use client';

import { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortedCategories = ['All', ...categories.sort()];

  return (
    <div className="mb-8">
      {/* Desktop: Organized grid layout */}
      <div className="hidden md:block">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent bg-white text-gray-900 font-medium min-w-[250px]"
          >
            <option value="All">All Products</option>
            {categories.sort().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile: Dropdown button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between text-gray-900 font-medium"
        >
          <span>{selectedCategory === 'All' ? 'All Products' : selectedCategory}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <button
              onClick={() => {
                onCategoryChange('All');
                setIsDropdownOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                selectedCategory === 'All' ? 'bg-lavender-50 text-lavender-700 font-semibold' : 'text-gray-700'
              }`}
            >
              All Products
            </button>
            {categories.sort().map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                  selectedCategory === category ? 'bg-lavender-50 text-lavender-700 font-semibold' : 'text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

