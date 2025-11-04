// Script to download product images from Unsplash or other sources
// Run with: node scripts/downloadProductImages.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// Product image mappings - using Unsplash search terms
const productImageMap = {
  'placeholder-1': { search: 'lavender soap bar natural handmade', filename: 'product-lavender-soap.jpg' },
  'placeholder-5': { search: 'goat milk soap bar', filename: 'product-goat-milk-soap.jpg' },
  'placeholder-6': { search: 'honey oat soap bar', filename: 'product-honey-oat-soap.jpg' },
  'placeholder-2': { search: 'honey body lotion bottle', filename: 'product-honey-lotion.jpg' },
  'placeholder-7': { search: 'lavender body lotion', filename: 'product-lavender-lotion.jpg' },
  'placeholder-3': { search: 'lavender salve balm tin', filename: 'product-lavender-salve.jpg' },
  'placeholder-8': { search: 'lavender lip balm', filename: 'product-lip-balm.jpg' },
  'placeholder-9': { search: 'hand salve cream', filename: 'product-hand-salve.jpg' },
  'placeholder-4': { search: 'dried lavender bundle', filename: 'product-lavender-bundle.jpg' },
  'placeholder-10': { search: 'lavender sachet', filename: 'product-lavender-sachet.jpg' },
  'placeholder-11': { search: 'lavender face cream', filename: 'product-face-cream.jpg' },
  'placeholder-12': { search: 'rosehip facial serum', filename: 'product-facial-serum.jpg' },
  'placeholder-13': { search: 'shampoo bar natural', filename: 'product-shampoo-bar.jpg' },
  'placeholder-14': { search: 'conditioner bar', filename: 'product-conditioner-bar.jpg' },
  'placeholder-15': { search: 'farm t-shirt cotton', filename: 'product-tshirt.jpg' },
  'placeholder-16': { search: 'farm sweatshirt', filename: 'product-sweatshirt.jpg' },
  'placeholder-17': { search: 'body scrub lavender', filename: 'product-body-scrub.jpg' },
  'placeholder-18': { search: 'wildflower honey jar', filename: 'product-honey.jpg' },
  'placeholder-19': { search: 'lavender honey jar', filename: 'product-lavender-honey.jpg' },
};

// Alternative: Use placeholder.com for consistent product-style images
// This is a free service that generates placeholder images
function getPlaceholderImageUrl(productId, width = 600, height = 600) {
  const map = productImageMap[productId];
  if (!map) return null;
  
  // Using placeholder.com with text label
  const label = encodeURIComponent(map.filename.replace('.jpg', '').replace(/-/g, ' '));
  return `https://via.placeholder.com/${width}x${height}.jpg?text=${label}`;
}

// For now, let's use a service that provides free product images
// Using Unsplash Source (no API key needed for basic use)
function getUnsplashImageUrl(searchTerm, width = 600, height = 600) {
  const encoded = encodeURIComponent(searchTerm);
  // Unsplash Source requires API, so let's use placeholder.com for now
  // and provide instructions for upgrading to Unsplash
  return getPlaceholderImageUrl(searchTerm, width, height);
}

console.log('Product Image URLs (using placeholder.com):');
console.log('==========================================\n');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate image URLs and update instructions
const imageUrls = {};
Object.keys(productImageMap).forEach(productId => {
  const map = productImageMap[productId];
  const url = getPlaceholderImageUrl(productId);
  imageUrls[productId] = { filename: map.filename, url };
  console.log(`${map.filename}: ${url}`);
});

console.log('\n==========================================');
console.log('NOTE: These are placeholder URLs.');
console.log('For better results, consider:');
console.log('1. Using Unsplash API (free tier available)');
console.log('2. Using AI image generation services');
console.log('3. Manually downloading images from parwellfarms.com');
console.log('\nTo use real images, update data/placeholderProducts.ts with the new URLs.');

// Export for use in other scripts
module.exports = { productImageMap, getPlaceholderImageUrl };

