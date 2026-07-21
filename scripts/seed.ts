import { prisma } from '../src/lib/prisma';
import { generateSlug } from '../src/lib/utils';

async function seed() {
  console.log('Seeding database...');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@etruemart.com',
      passwordHash: '$2a$12$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
      name: 'Admin',
      role: 'ADMIN',
      referralCode: 'ADMIN001',
    },
  });

  const shop = await prisma.shop.create({
    data: {
      name: 'eTruemart Store',
      slug: 'etruemart-store',
      description: 'Official eTruemart store offering quality products worldwide',
      ownerId: adminUser.id,
    },
  });

  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      description: 'Premium wireless Bluetooth headphones with noise cancellation. 40 hours battery life.',
      priceMin: 49.99,
      priceMax: 89.99,
      mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      salesCount: 1234,
      rating: 4.5,
      shopId: shop.id,
      variations: [
        { color: 'Black', size: 'One Size', price: 49.99, stock: 50, skuSuffix: '-BK' },
        { color: 'White', size: 'One Size', price: 54.99, stock: 30, skuSuffix: '-WT' },
        { color: 'Blue', size: 'One Size', price: 54.99, stock: 25, skuSuffix: '-BL' },
      ],
    },
    {
      name: 'Smart Watch Fitness Tracker',
      sku: 'SW-001',
      category: 'Electronics',
      description: 'Advanced smart watch with heart rate monitor, GPS, and fitness tracking.',
      priceMin: 79.99,
      priceMax: 129.99,
      mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
      salesCount: 892,
      rating: 4.3,
      shopId: shop.id,
      variations: [
        { color: 'Black', size: '42mm', price: 79.99, stock: 40, skuSuffix: '-BK-42' },
        { color: 'Silver', size: '42mm', price: 89.99, stock: 20, skuSuffix: '-SV-42' },
        { color: 'Black', size: '46mm', price: 99.99, stock: 35, skuSuffix: '-BK-46' },
      ],
    },
    {
      name: 'Cotton T-Shirt - Pack of 3',
      sku: 'TS-001',
      category: 'Apparel',
      description: 'Premium 100% cotton t-shirts. Comfortable and durable.',
      priceMin: 29.99,
      priceMax: 49.99,
      mainImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=800&fit=crop',
      salesCount: 2341,
      rating: 4.7,
      shopId: shop.id,
      variations: [
        { color: 'White', size: 'S', price: 29.99, stock: 100, skuSuffix: '-WT-S' },
        { color: 'Black', size: 'M', price: 32.99, stock: 80, skuSuffix: '-BK-M' },
        { color: 'Gray', size: 'L', price: 32.99, stock: 60, skuSuffix: '-GY-L' },
      ],
    },
    {
      name: 'Leather Wallet',
      sku: 'WL-001',
      category: 'Hand Bag',
      description: 'Genuine leather wallet with multiple card slots and RFID protection.',
      priceMin: 39.99,
      priceMax: 79.99,
      mainImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=800&fit=crop',
      salesCount: 567,
      rating: 4.6,
      shopId: shop.id,
      variations: [
        { color: 'Brown', size: 'Standard', price: 39.99, stock: 45, skuSuffix: '-BR' },
        { color: 'Black', size: 'Standard', price: 44.99, stock: 30, skuSuffix: '-BK' },
        { color: 'Brown', size: 'Large', price: 59.99, stock: 20, skuSuffix: '-BR-LG' },
      ],
    },
    {
      name: 'Kitchen Knife Set - 5 Pieces',
      sku: 'KT-001',
      category: 'Kitchenware',
      description: 'Professional kitchen knife set with high carbon stainless steel blades.',
      priceMin: 59.99,
      priceMax: 99.99,
      mainImage: 'https://images.unsplash.com/photo-1570469132729-bc300a0d025c?w=800&h=800&fit=crop',
      salesCount: 423,
      rating: 4.8,
      shopId: shop.id,
      variations: [
        { color: 'Silver', size: '5-Piece', price: 59.99, stock: 35, skuSuffix: '-SV-5' },
        { color: 'Black', size: '5-Piece', price: 64.99, stock: 25, skuSuffix: '-BK-5' },
        { color: 'Silver', size: '7-Piece', price: 89.99, stock: 15, skuSuffix: '-SV-7' },
      ],
    },
    {
      name: 'Portable Power Bank 20000mAh',
      sku: 'PB-001',
      category: 'Electronics',
      description: 'High capacity portable charger with fast charging support.',
      priceMin: 24.99,
      priceMax: 49.99,
      mainImage: 'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800&h=800&fit=crop',
      salesCount: 1876,
      rating: 4.4,
      shopId: shop.id,
      variations: [
        { color: 'Black', size: '10000mAh', price: 24.99, stock: 60, skuSuffix: '-BK-10K' },
        { color: 'White', size: '20000mAh', price: 39.99, stock: 40, skuSuffix: '-WT-20K' },
        { color: 'Blue', size: '20000mAh', price: 44.99, stock: 30, skuSuffix: '-BL-20K' },
      ],
    },
    {
      name: 'Yoga Mat Non-Slip',
      sku: 'YG-001',
      category: 'Sports & Outdoors',
      description: 'Premium non-slip yoga mat with alignment markers.',
      priceMin: 19.99,
      priceMax: 39.99,
      mainImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
      salesCount: 789,
      rating: 4.5,
      shopId: shop.id,
      variations: [
        { color: 'Purple', size: 'Standard', price: 19.99, stock: 50, skuSuffix: '-PR' },
        { color: 'Blue', size: 'Standard', price: 19.99, stock: 45, skuSuffix: '-BL' },
        { color: 'Black', size: 'Extra Long', price: 34.99, stock: 20, skuSuffix: '-BK-XL' },
      ],
    },
    {
      name: 'LED Desk Lamp',
      sku: 'DL-001',
      category: 'Home & Kitchen',
      description: 'Dimmable LED desk lamp with adjustable arm and eye protection.',
      priceMin: 34.99,
      priceMax: 59.99,
      mainImage: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=800&fit=crop',
      salesCount: 345,
      rating: 4.3,
      shopId: shop.id,
      variations: [
        { color: 'White', size: 'Standard', price: 34.99, stock: 40, skuSuffix: '-WT' },
        { color: 'Black', size: 'Standard', price: 39.99, stock: 30, skuSuffix: '-BK' },
        { color: 'Silver', size: 'Premium', price: 54.99, stock: 15, skuSuffix: '-SV-PR' },
      ],
    },
    {
      name: 'Kids Building Blocks Set',
      sku: 'TY-001',
      category: 'Toys & Games',
      description: 'Educational building blocks set for kids. 500 pieces.',
      priceMin: 29.99,
      priceMax: 59.99,
      mainImage: 'https://images.unsplash.com/photo-1596476556746-271e7358cf4c?w=800&h=800&fit=crop',
      salesCount: 1123,
      rating: 4.7,
      shopId: shop.id,
      variations: [
        { color: 'Multi-color', size: '300pcs', price: 29.99, stock: 50, skuSuffix: '-MC-300' },
        { color: 'Multi-color', size: '500pcs', price: 44.99, stock: 35, skuSuffix: '-MC-500' },
        { color: 'Multi-color', size: '1000pcs', price: 59.99, stock: 20, skuSuffix: '-MC-1000' },
      ],
    },
    {
      name: 'Gardening Tool Set',
      sku: 'GD-001',
      category: 'Garden',
      description: 'Complete gardening tool set with ergonomic handles.',
      priceMin: 24.99,
      priceMax: 49.99,
      mainImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=800&fit=crop',
      salesCount: 234,
      rating: 4.4,
      shopId: shop.id,
      variations: [
        { color: 'Green', size: '5-Piece', price: 24.99, stock: 40, skuSuffix: '-GR-5' },
        { color: 'Red', size: '5-Piece', price: 29.99, stock: 30, skuSuffix: '-RD-5' },
        { color: 'Green', size: '10-Piece', price: 44.99, stock: 20, skuSuffix: '-GR-10' },
      ],
    },
    {
      name: 'Storage Boxes Set',
      sku: 'ST-001',
      category: 'Storage',
      description: 'Stackable storage boxes with lids. Set of 6.',
      priceMin: 19.99,
      priceMax: 39.99,
      mainImage: 'https://images.unsplash.com/photo-1505673542768-90698b359d70?w=800&h=800&fit=crop',
      salesCount: 678,
      rating: 4.6,
      shopId: shop.id,
      variations: [
        { color: 'Clear', size: 'Small (6pcs)', price: 19.99, stock: 50, skuSuffix: '-CL-SM' },
        { color: 'Clear', size: 'Medium (4pcs)', price: 29.99, stock: 35, skuSuffix: '-CL-MD' },
        { color: 'Colorful', size: 'Mixed (6pcs)', price: 34.99, stock: 30, skuSuffix: '-MC' },
      ],
    },
    {
      name: 'USB-C Hub 7-in-1',
      sku: 'HB-001',
      category: 'Electronics',
      description: 'Multi-port USB-C hub with HDMI, USB-A, SD card reader.',
      priceMin: 34.99,
      priceMax: 59.99,
      mainImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=800&fit=crop',
      salesCount: 456,
      rating: 4.5,
      shopId: shop.id,
      variations: [
        { color: 'Silver', size: '7-in-1', price: 34.99, stock: 40, skuSuffix: '-SV-7' },
        { color: 'Black', size: '7-in-1', price: 39.99, stock: 30, skuSuffix: '-BK-7' },
        { color: 'Silver', size: '11-in-1', price: 54.99, stock: 20, skuSuffix: '-SV-11' },
      ],
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: {
        name: productData.name,
        slug: generateSlug(productData.name),
        sku: productData.sku,
        category: productData.category,
        description: productData.description,
        priceMin: productData.priceMin,
        priceMax: productData.priceMax,
        mainImage: productData.mainImage,
        salesCount: productData.salesCount,
        rating: productData.rating,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        shopId: productData.shopId,
        variations: {
          create: productData.variations,
        },
      },
    });
  }

  console.log('Database seeded successfully!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});