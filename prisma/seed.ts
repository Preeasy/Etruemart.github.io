import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg(connectionString!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@etruemart.com' },
    update: {},
    create: {
      email: 'admin@etruemart.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '+1234567890',
      referralCode: 'ADMIN001',
    },
  });

  const shop = await prisma.shop.upsert({
    where: { id: 'default-shop' },
    update: {},
    create: {
      id: 'default-shop',
      name: 'eTruemart Official',
      slug: 'etruemart-official',
      description: 'Official eTruemart store with premium products.',
      ownerId: user.id,
    },
  });

  const products = [
    {
      name: 'Premium Wireless Earbuds',
      sku: 'ET-WE-001',
      category: 'Electronics',
      description: 'High-quality wireless earbuds with active noise cancellation and 30-hour battery life.',
      priceMin: 29.99,
      priceMax: 49.99,
      mainImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
      material: 'ABS Plastic',
      moq: 10,
      shopId: shop.id,
      variations: [
        { color: 'Black', size: 'One Size', price: 29.99, stock: 100, skuSuffix: '-BK' },
        { color: 'White', size: 'One Size', price: 29.99, stock: 80, skuSuffix: '-WH' },
        { color: 'Blue', size: 'One Size', price: 34.99, stock: 50, skuSuffix: '-BL' },
      ],
    },
    {
      name: 'Stainless Steel Water Bottle',
      sku: 'ET-KW-001',
      category: 'Kitchenware',
      description: 'Double-wall vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.',
      priceMin: 12.99,
      priceMax: 18.99,
      mainImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
      material: '304 Stainless Steel',
      moq: 20,
      shopId: shop.id,
      variations: [
        { color: 'Silver', size: '500ml', price: 12.99, stock: 200, skuSuffix: '-SV-500' },
        { color: 'Silver', size: '750ml', price: 15.99, stock: 150, skuSuffix: '-SV-750' },
        { color: 'Black', size: '500ml', price: 13.99, stock: 100, skuSuffix: '-BK-500' },
        { color: 'Rose Gold', size: '500ml', price: 18.99, stock: 60, skuSuffix: '-RG-500' },
      ],
    },
    {
      name: 'Organic Cotton T-Shirt',
      sku: 'ET-AP-001',
      category: 'Apparel',
      description: 'Premium organic cotton t-shirt with a relaxed fit. Soft, breathable, and sustainably made.',
      priceMin: 15.99,
      priceMax: 22.99,
      mainImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      material: '100% Organic Cotton',
      moq: 30,
      shopId: shop.id,
      variations: [
        { color: 'White', size: 'S', price: 15.99, stock: 100, skuSuffix: '-WH-S' },
        { color: 'White', size: 'M', price: 15.99, stock: 150, skuSuffix: '-WH-M' },
        { color: 'White', size: 'L', price: 15.99, stock: 120, skuSuffix: '-WH-L' },
        { color: 'Black', size: 'M', price: 15.99, stock: 100, skuSuffix: '-BK-M' },
        { color: 'Navy', size: 'L', price: 16.99, stock: 80, skuSuffix: '-NV-L' },
      ],
    },
    {
      name: 'Smart LED Desk Lamp',
      sku: 'ET-HM-001',
      category: 'Home',
      description: 'Adjustable LED desk lamp with touch controls, 5 color modes, and USB charging port.',
      priceMin: 35.99,
      priceMax: 45.99,
      mainImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
      material: 'Aluminum Alloy',
      moq: 10,
      shopId: shop.id,
      variations: [
        { color: 'White', size: 'One Size', price: 35.99, stock: 60, skuSuffix: '-WH' },
        { color: 'Black', size: 'One Size', price: 35.99, stock: 50, skuSuffix: '-BK' },
      ],
    },
    {
      name: 'Foldable Yoga Mat',
      sku: 'ET-SP-001',
      category: 'Sports',
      description: 'Non-slip TPE yoga mat with alignment lines. Foldable design for easy travel.',
      priceMin: 24.99,
      priceMax: 32.99,
      mainImage: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
      material: 'TPE Eco-friendly',
      moq: 15,
      shopId: shop.id,
      variations: [
        { color: 'Purple', size: '6mm', price: 24.99, stock: 80, skuSuffix: '-PP-6' },
        { color: 'Green', size: '6mm', price: 24.99, stock: 70, skuSuffix: '-GN-6' },
        { color: 'Pink', size: '8mm', price: 32.99, stock: 40, skuSuffix: '-PK-8' },
      ],
    },
    {
      name: 'Portable Bluetooth Speaker',
      sku: 'ET-EL-002',
      category: 'Electronics',
      description: 'Waterproof Bluetooth speaker with 360-degree sound and 20-hour playtime.',
      priceMin: 39.99,
      priceMax: 59.99,
      mainImage: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
      material: 'Silicone + Fabric',
      moq: 8,
      shopId: shop.id,
      variations: [
        { color: 'Black', size: 'One Size', price: 39.99, stock: 90, skuSuffix: '-BK' },
        { color: 'Blue', size: 'One Size', price: 42.99, stock: 60, skuSuffix: '-BL' },
        { color: 'Red', size: 'One Size', price: 42.99, stock: 50, skuSuffix: '-RD' },
      ],
    },
  ];

  for (const productData of products) {
    const { variations, ...product } = productData;
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        ...product,
        slug,
        variations: { create: variations },
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
