#!/usr/bin/env node
/**
 * 批量导入新产品到数据库
 * 使用方式: node scripts/add-products.cjs
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始批量导入产品...');

  // 1. 确保 admin 用户存在
  const adminEmail = 'etruemart';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.findUnique({ where: { email: 'Yeatrusourcing' } });
  }
  if (!admin) {
    console.log('⚠️  未找到admin用户，正在创建...');
    const hashedPassword = await bcrypt.hash('Ldz52385109', 10);
    admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: 'eTruemart Admin',
        role: 'ADMIN',
      },
    });
  }
  console.log(`✅ Admin用户: ${admin.email} (${admin.id})`);

  // 2. 读取分类数据并同步到数据库
  const catDataPath = path.join(process.cwd(), 'categories-data.json');
  const catData = JSON.parse(fs.readFileSync(catDataPath, 'utf-8'));
  const catItems = catData.categories || [];

  const slugToId = {};

  // 先处理根分类
  for (const cat of catItems) {
    if (!cat.parentId) {
      const record = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.seoDesc || '',
          sortOrder: cat.sortOrder || 0,
        },
      });
      slugToId[cat.slug] = record.id;
    }
  }

  // 处理子分类（多轮）
  for (let pass = 0; pass < 10; pass++) {
    let created = 0;
    for (const cat of catItems) {
      if (cat.parentId && !slugToId[cat.slug] && slugToId[cat.parentId]) {
        const record = await prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name, parentId: slugToId[cat.parentId] },
          create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.seoDesc || '',
            sortOrder: cat.sortOrder || 0,
            parentId: slugToId[cat.parentId],
          },
        });
        slugToId[cat.slug] = record.id;
        created++;
      }
    }
    if (created === 0) break;
  }
  console.log(`✅ 分类同步完成: ${Object.keys(slugToId).length} 个分类`);

  // 3. 读取新产品数据
  const productsPath = path.join(process.cwd(), 'new-products.json');
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const products = productsData.products || [];

  console.log(`📦 准备导入 ${products.length} 个产品...`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const productData of products) {
    try {
      const categoryId = slugToId[productData.categorySlug];
      if (!categoryId) {
        errors.push(`${productData.name}: 分类 ${productData.categorySlug} 不存在`);
        failed++;
        continue;
      }

      const originalPrice = productData.priceMax > productData.priceMin
        ? productData.priceMax * 1.5
        : productData.priceMin * 1.3;

      const images = JSON.stringify(productData.images || [productData.image]);
      const keywords = JSON.stringify(productData.keywords || []);

      const variations = productData.variations || [
        { color: 'Default', size: 'One Size', price: productData.priceMin, stock: 100 }
      ];

      const existing = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (existing) {
        // 更新已有产品
        await prisma.product.update({
          where: { slug: productData.slug },
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.priceMin,
            priceMax: productData.priceMax,
            originalPrice: parseFloat(originalPrice.toFixed(2)),
            image: productData.image,
            images: images,
            categoryId: categoryId,
            material: productData.material || null,
            plating: productData.plating || null,
            process: productData.process || null,
            color: productData.color || null,
            size: productData.size || null,
            packSize: productData.packSize || 1,
            pkgLength: productData.pkgLength || null,
            pkgWidth: productData.pkgWidth || null,
            pkgHeight: productData.pkgHeight || null,
            pkgWeight: productData.pkgWeight || null,
            moq: productData.moq || 1,
            sku: productData.sku || null,
            origin: productData.origin || 'Yiwu, China',
            supplierCity: productData.supplierCity || 'Yiwu',
            stockStatus: productData.stockStatus || 'IN_STOCK',
            keywords: keywords,
            authorId: admin.id,
          },
        });

        // 更新variants
        await prisma.productVariant.deleteMany({
          where: { productId: existing.id },
        });
        for (const v of variations) {
          await prisma.productVariant.create({
            data: {
              productId: existing.id,
              color: v.color || 'Default',
              size: v.size || 'One Size',
              price: parseFloat(String(v.price)),
              stock: v.stock || 100,
            },
          });
        }
        console.log(`  ✏️  更新: ${productData.name}`);
      } else {
        // 创建新产品
        const newProduct = await prisma.product.create({
          data: {
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            price: productData.priceMin,
            priceMax: productData.priceMax,
            originalPrice: parseFloat(originalPrice.toFixed(2)),
            image: productData.image,
            images: images,
            categoryId: categoryId,
            material: productData.material || null,
            plating: productData.plating || null,
            process: productData.process || null,
            color: productData.color || null,
            size: productData.size || null,
            packSize: productData.packSize || 1,
            pkgLength: productData.pkgLength || null,
            pkgWidth: productData.pkgWidth || null,
            pkgHeight: productData.pkgHeight || null,
            pkgWeight: productData.pkgWeight || null,
            moq: productData.moq || 1,
            sku: productData.sku || null,
            origin: productData.origin || 'Yiwu, China',
            supplierCity: productData.supplierCity || 'Yiwu',
            stockStatus: productData.stockStatus || 'IN_STOCK',
            keywords: keywords,
            authorId: admin.id,
            variants: {
              create: variations.map(v => ({
                color: v.color || 'Default',
                size: v.size || 'One Size',
                price: parseFloat(String(v.price)),
                stock: v.stock || 100,
              })),
            },
          },
        });
        console.log(`  ✅ 新增: ${productData.name}`);
      }
      success++;
    } catch (err) {
      errors.push(`${productData.name}: ${err.message}`);
      failed++;
      console.error(`  ❌ 失败: ${productData.name} - ${err.message}`);
    }
  }

  console.log('\n========== 导入结果 ==========');
  console.log(`✅ 成功: ${success}`);
  console.log(`❌ 失败: ${failed}`);
  if (errors.length > 0) {
    console.log('\n错误详情:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // 统计总数
  const totalProducts = await prisma.product.count();
  console.log(`\n📊 数据库产品总数: ${totalProducts}`);
}

main()
  .catch(e => {
    console.error('导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
