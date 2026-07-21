export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  stock: number;
  variants: { color: string; size: string; price: number }[];
  features: string[];
  shippingInfo: {
    us: string;
    ca: string;
    uk: string;
  };
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    category: 'Electronics',
    description: 'Premium wireless Bluetooth headphones with advanced active noise cancellation. 40 hours of battery life, comfortable over-ear design, and crystal clear sound quality.',
    price: 79.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=800&fit=crop',
    ],
    rating: 4.7,
    reviewCount: 1247,
    salesCount: 3420,
    stock: 156,
    variants: [
      { color: 'Black', size: 'Standard', price: 79.99 },
      { color: 'White', size: 'Standard', price: 84.99 },
      { color: 'Blue', size: 'Standard', price: 84.99 },
    ],
    features: [
      'Active Noise Cancellation',
      '40 Hours Battery Life',
      'Bluetooth 5.3',
      'Premium Memory Foam Cushions',
      'Built-in Microphone',
      'Carry Case Included',
    ],
    shippingInfo: {
      us: '3-5 business days',
      ca: '5-7 business days',
      uk: '4-6 business days',
    },
  },
  {
    id: '2',
    name: 'Smart Fitness Watch Pro',
    slug: 'smart-fitness-watch-pro',
    category: 'Electronics',
    description: 'Advanced smartwatch with heart rate monitor, GPS tracking, sleep analysis, and 7-day battery life. Water resistant up to 50 meters.',
    price: 99.99,
    originalPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bbdfc?w=800&h=800&fit=crop',
    ],
    rating: 4.5,
    reviewCount: 856,
    salesCount: 2180,
    stock: 89,
    variants: [
      { color: 'Black', size: '42mm', price: 99.99 },
      { color: 'Silver', size: '42mm', price: 109.99 },
      { color: 'Black', size: '46mm', price: 119.99 },
    ],
    features: [
      'Heart Rate Monitor',
      'GPS Tracking',
      'Sleep Analysis',
      '7-Day Battery',
      '50m Water Resistant',
      '100+ Sport Modes',
    ],
    shippingInfo: {
      us: '3-5 business days',
      ca: '5-7 business days',
      uk: '4-6 business days',
    },
  },
  {
    id: '3',
    name: 'Premium Cotton T-Shirt 3-Pack',
    slug: 'premium-cotton-t-shirt-3-pack',
    category: 'Apparel',
    description: 'Set of 3 premium 100% cotton t-shirts. Ultra-soft, breathable, and preshrunk. Available in multiple colors.',
    price: 34.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
    ],
    rating: 4.8,
    reviewCount: 2341,
    salesCount: 5670,
    stock: 420,
    variants: [
      { color: 'Multi-color', size: 'S', price: 34.99 },
      { color: 'Multi-color', size: 'M', price: 34.99 },
      { color: 'Multi-color', size: 'L', price: 34.99 },
      { color: 'Multi-color', size: 'XL', price: 39.99 },
    ],
    features: [
      '100% Premium Cotton',
      'Preshrunk & Soft',
      'Breathable Fabric',
      '3-Pack Value',
      'Classic Fit',
      'Machine Washable',
    ],
    shippingInfo: {
      us: '2-4 business days',
      ca: '4-6 business days',
      uk: '3-5 business days',
    },
  },
  {
    id: '4',
    name: 'Genuine Leather RFID Wallet',
    slug: 'genuine-leather-rfid-wallet',
    category: 'Accessories',
    description: 'Handcrafted genuine leather wallet with RFID blocking protection. Multiple card slots and bill compartment.',
    price: 44.99,
    originalPrice: 69.99,
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89075b4a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594179684227-6b922684682f?w=800&h=800&fit=crop',
    ],
    rating: 4.6,
    reviewCount: 678,
    salesCount: 1450,
    stock: 234,
    variants: [
      { color: 'Brown', size: 'Standard', price: 44.99 },
      { color: 'Black', size: 'Standard', price: 44.99 },
      { color: 'Tan', size: 'Standard', price: 49.99 },
    ],
    features: [
      '100% Genuine Leather',
      'RFID Blocking',
      '8 Card Slots',
      '2 Bill Compartments',
      'ID Window',
      'Slim Design',
    ],
    shippingInfo: {
      us: '3-5 business days',
      ca: '5-7 business days',
      uk: '4-6 business days',
    },
  },
  {
    id: '5',
    name: 'Professional Kitchen Knife Set',
    slug: 'professional-kitchen-knife-set',
    category: 'Home & Kitchen',
    description: '5-piece professional kitchen knife set with high carbon stainless steel blades. Ergonomic handles and sharp edges.',
    price: 69.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1570469132729-bc300a0d025c?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1570469132729-bc300a0d025c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3131?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517457107284-c760bc771e0?w=800&h=800&fit=crop',
    ],
    rating: 4.9,
    reviewCount: 567,
    salesCount: 980,
    stock: 78,
    variants: [
      { color: 'Silver', size: '5-Piece', price: 69.99 },
      { color: 'Black', size: '5-Piece', price: 74.99 },
      { color: 'Silver', size: '7-Piece', price: 99.99 },
    ],
    features: [
      'High Carbon Stainless Steel',
      'Ultra Sharp Blades',
      'Ergonomic Handles',
      'Rust Resistant',
      'Easy to Clean',
      'Gift Box Included',
    ],
    shippingInfo: {
      us: '2-4 business days',
      ca: '4-6 business days',
      uk: '3-5 business days',
    },
  },
  {
    id: '6',
    name: 'Portable Power Bank 20000mAh',
    slug: 'portable-power-bank-20000mah',
    category: 'Electronics',
    description: 'High capacity 20000mAh portable charger with fast charging. Dual USB ports and LED power indicator.',
    price: 39.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop',
    ],
    rating: 4.4,
    reviewCount: 1893,
    salesCount: 4230,
    stock: 312,
    variants: [
      { color: 'Black', size: '10000mAh', price: 24.99 },
      { color: 'White', size: '20000mAh', price: 39.99 },
      { color: 'Blue', size: '20000mAh', price: 44.99 },
    ],
    features: [
      '20000mAh Capacity',
      'Fast Charging',
      'Dual USB Ports',
      'LED Indicator',
      'Compact Design',
      'Multiple Protection',
    ],
    shippingInfo: {
      us: '3-5 business days',
      ca: '5-7 business days',
      uk: '4-6 business days',
    },
  },
  {
    id: '7',
    name: 'Non-Slip Yoga Mat Premium',
    slug: 'non-slip-yoga-mat-premium',
    category: 'Sports & Outdoors',
    description: 'Premium non-slip yoga mat with alignment markers. Extra thick and eco-friendly TPE material.',
    price: 29.99,
    originalPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591228127229-dea8e546a182?w=800&h=800&fit=crop',
    ],
    rating: 4.7,
    reviewCount: 1124,
    salesCount: 2560,
    stock: 189,
    variants: [
      { color: 'Purple', size: 'Standard', price: 29.99 },
      { color: 'Blue', size: 'Standard', price: 29.99 },
      { color: 'Black', size: 'Extra Long', price: 39.99 },
    ],
    features: [
      'Non-Slip Surface',
      'Eco-Friendly TPE',
      'Alignment Markers',
      'Extra Thick 6mm',
      'Carry Strap Included',
      'Easy to Clean',
    ],
    shippingInfo: {
      us: '2-4 business days',
      ca: '4-6 business days',
      uk: '3-5 business days',
    },
  },
  {
    id: '8',
    name: 'LED Desk Lamp with USB Port',
    slug: 'led-desk-lamp-with-usb-port',
    category: 'Home & Kitchen',
    description: 'Dimmable LED desk lamp with adjustable arm, touch control, and built-in USB charging port.',
    price: 49.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=800&fit=crop',
    ],
    rating: 4.5,
    reviewCount: 456,
    salesCount: 890,
    stock: 145,
    variants: [
      { color: 'White', size: 'Standard', price: 49.99 },
      { color: 'Black', size: 'Standard', price: 49.99 },
      { color: 'Silver', size: 'Premium', price: 69.99 },
    ],
    features: [
      'Eye-Caring LED',
      '3 Color Modes',
      'Brightness Dimmable',
      'Adjustable Arm',
      'USB Charging Port',
      'Touch Control',
    ],
    shippingInfo: {
      us: '2-4 business days',
      ca: '4-6 business days',
      uk: '3-5 business days',
    },
  },
];

export const categories = [
  { name: 'Electronics', count: 128, icon: 'Headphones' },
  { name: 'Apparel', count: 256, icon: 'Shirt' },
  { name: 'Home & Kitchen', count: 89, icon: 'Home' },
  { name: 'Accessories', count: 67, icon: 'Watch' },
  { name: 'Sports & Outdoors', count: 45, icon: 'Dumbbell' },
  { name: 'Toys & Games', count: 112, icon: 'Gamepad2' },
  { name: 'Beauty', count: 78, icon: 'Sparkles' },
  { name: 'Garden', count: 56, icon: 'Flower2' },
];
