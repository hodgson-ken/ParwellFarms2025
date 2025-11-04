// Placeholder products for development
// These are sample products until Square integration is configured

export interface PlaceholderProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  imageUrl: string;
  category: string;
}

export const placeholderProducts: PlaceholderProduct[] = [
  // Soap Category
  {
    id: 'placeholder-1',
    name: 'Lavender Soap',
    description: 'Handcrafted lavender soap made with natural ingredients from our farm. This gentle, moisturizing soap features the calming scent of our homegrown lavender and is perfect for daily use.',
    price: 1250, // $12.50
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80',
    category: 'Soap',
  },
  {
    id: 'placeholder-5',
    name: 'Goat Milk Soap Bar',
    description: 'Rich, creamy goat milk soap bar with shea butter and essential oils. Gentle enough for sensitive skin while providing deep moisturization and a luxurious lather.',
    price: 1399, // $13.99
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80',
    category: 'Soap',
  },
  {
    id: 'placeholder-6',
    name: 'Honey Oat Soap',
    description: 'Nourishing soap made with local honey and colloidal oatmeal. Perfect for soothing dry or irritated skin while leaving a subtle, natural honey scent.',
    price: 1299, // $12.99
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80',
    category: 'Soap',
  },
  // Lotion Hand & Body
  {
    id: 'placeholder-2',
    name: 'Honey & Oat Body Lotion',
    description: 'Moisturizing body lotion with local honey and soothing oat extract. This rich, creamy lotion provides deep hydration and leaves your skin feeling soft and nourished all day long.',
    price: 1899, // $18.99
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80',
    category: 'Lotion Hand & Body',
  },
  {
    id: 'placeholder-7',
    name: 'Lavender Body Lotion',
    description: 'Calming body lotion infused with lavender essential oil and vitamin E. Absorbs quickly without feeling greasy, leaving your skin smooth and delicately scented.',
    price: 1999, // $19.99
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80',
    category: 'Lotion Hand & Body',
  },
  // Butters Balms & Salves
  {
    id: 'placeholder-3',
    name: 'Lavender Salve',
    description: 'Healing salve perfect for dry skin and minor irritations. Made with organic lavender oil and natural beeswax from our hives. A versatile balm that soothes and protects.',
    price: 1499, // $14.99
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop&q=80',
    category: 'Butters Balms & Salves',
  },
  {
    id: 'placeholder-8',
    name: 'Lavender Lip Balm',
    description: 'Moisturizing lip balm made with beeswax, shea butter, and lavender essential oil. Provides long-lasting protection and a subtle lavender flavor.',
    price: 699, // $6.99
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80',
    category: 'Butters Balms & Salves',
  },
  {
    id: 'placeholder-9',
    name: 'Hand Salve',
    description: 'Intensive hand salve for hard-working hands. Rich blend of beeswax, calendula, and essential oils to heal and protect even the driest skin.',
    price: 1699, // $16.99
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop&q=80',
    category: 'Butters Balms & Salves',
  },
  // Lavender
  {
    id: 'placeholder-4',
    name: 'Farm Fresh Lavender Bundle',
    description: 'A beautiful bundle of dried lavender from our fields. Perfect for home decoration, potpourri, or creating a relaxing atmosphere. Each bundle is hand-tied and carefully dried.',
    price: 2499, // $24.99
    imageUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=600&fit=crop&q=80',
    category: 'Lavender',
  },
  {
    id: 'placeholder-10',
    name: 'Dried Lavender Sachets',
    description: 'Small sachets filled with fragrant dried lavender. Perfect for drawers, closets, or as a natural air freshener. Each sachet is hand-sewn and filled.',
    price: 899, // $8.99
    imageUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=600&fit=crop&q=80',
    category: 'Lavender',
  },
  // Face
  {
    id: 'placeholder-11',
    name: 'Lavender Face Cream',
    description: 'Gentle face cream formulated with lavender and chamomile. Suitable for all skin types, provides lightweight hydration without clogging pores.',
    price: 2299, // $22.99
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80',
    category: 'Face',
  },
  {
    id: 'placeholder-12',
    name: 'Rosehip Facial Serum',
    description: 'Nourishing facial serum with rosehip oil and lavender extract. Helps reduce the appearance of fine lines while providing antioxidant protection.',
    price: 2799, // $27.99
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80',
    category: 'Face',
  },
  // Hair Care
  {
    id: 'placeholder-13',
    name: 'Lavender Shampoo Bar',
    description: 'All-natural shampoo bar with lavender essential oil. Cleanses hair gently while adding volume and a fresh lavender scent. Zero-waste packaging.',
    price: 1599, // $15.99
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80',
    category: 'Hair Care',
  },
  {
    id: 'placeholder-14',
    name: 'Honey Conditioner Bar',
    description: 'Moisturizing conditioner bar with local honey and argan oil. Detangles and conditions hair naturally while reducing frizz and adding shine.',
    price: 1599, // $15.99
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80',
    category: 'Hair Care',
  },
  // Apparel
  {
    id: 'placeholder-15',
    name: 'Parwell Farms T-Shirt',
    description: 'Comfortable cotton t-shirt featuring the Parwell Farms logo. Made from soft, breathable fabric perfect for everyday wear. Available in multiple sizes.',
    price: 2499, // $24.99
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80',
    category: 'Apparel',
  },
  {
    id: 'placeholder-16',
    name: 'Farm Life Sweatshirt',
    description: 'Cozy fleece sweatshirt celebrating farm life. Warm and comfortable for cool mornings or evenings on the farm. Features Parwell Farms branding.',
    price: 4499, // $44.99
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop&q=80',
    category: 'Apparel',
  },
  // Body Care
  {
    id: 'placeholder-17',
    name: 'Lavender Body Scrub',
    description: 'Exfoliating body scrub made with sugar, lavender oil, and coconut oil. Gently removes dead skin cells while moisturizing, leaving skin soft and smooth.',
    price: 1899, // $18.99
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80',
    category: 'Body Care',
  },
  // Pantry
  {
    id: 'placeholder-18',
    name: 'Local Wildflower Honey',
    description: 'Pure wildflower honey harvested from our hives. Rich, flavorful, and unfiltered. Perfect for tea, baking, or drizzling over toast.',
    price: 1799, // $17.99
    imageUrl: 'https://images.unsplash.com/photo-1587049352841-23c73f6925b3?w=600&h=600&fit=crop&q=80',
    category: 'Pantry',
  },
  {
    id: 'placeholder-19',
    name: 'Lavender Honey',
    description: 'Honey infused with the essence of our lavender fields. A unique, delicate flavor perfect for special occasions or as a thoughtful gift.',
    price: 2299, // $22.99
    imageUrl: 'https://images.unsplash.com/photo-1587049352841-23c73f6925b3?w=600&h=600&fit=crop&q=80',
    category: 'Pantry',
  },
];

// Get placeholder product by ID
export function getPlaceholderProductById(id: string): PlaceholderProduct | null {
  return placeholderProducts.find(p => p.id === id) || null;
}

