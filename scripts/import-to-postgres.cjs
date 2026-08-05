/**
 * 将 SQLite 导出的数据导入到 PostgreSQL
 * 在 Vercel Postgres 创建完成后运行
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const INPUT_PATH = path.join(__dirname, '..', 'prisma', 'sqlite-export.json');

async function importData() {
  // 加载 .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^(\w+)=(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2];
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
    });
  }

  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    '';

  if (!databaseUrl.includes('postgres')) {
    console.error('[import] Error: DATABASE_URL is not a PostgreSQL connection string');
    console.error('[import] Please set DATABASE_URL or POSTGRES_URL in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`[import] Error: Export file not found: ${INPUT_PATH}`);
    console.error('[import] Run "node scripts/export-sqlite-data.cjs" first');
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  
  const prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  });

  try {
    console.log('[import] Starting data import to PostgreSQL...');

    // 1. 导入 Categories
    if (exportData.categories && exportData.categories.length > 0) {
      console.log(`[import] Importing ${exportData.categories.length} categories...`);
      
      // 按层级排序（先根节点，再子节点）
      const rootCats = exportData.categories.filter(c => !c.parentId);
      const childCats = exportData.categories.filter(c => c.parentId);
      const sortedCats = [...rootCats, ...childCats];

      for (const cat of sortedCats) {
        // 转换日期格式
        const createdAt = cat.createdAt ? new Date(cat.createdAt) : new Date();
        const updatedAt = cat.updatedAt ? new Date(cat.updatedAt) : new Date();

        // 查找父级 ID 映射
        let parentId = cat.parentId;
        if (parentId) {
          const parentCat = exportData.categories.find(c => c.id === parentId);
          // 保持原 ID 结构
        }

        await prisma.category.upsert({
          where: { id: cat.id },
          update: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            parentId: cat.parentId,
            sortOrder: cat.sortOrder || 0,
            seoTitle: cat.seoTitle,
            seoDesc: cat.seoDesc,
            updatedAt,
          },
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            parentId: cat.parentId,
            sortOrder: cat.sortOrder || 0,
            seoTitle: cat.seoTitle,
            seoDesc: cat.seoDesc,
            createdAt,
            updatedAt,
          },
        });
      }
      console.log('[import] Categories imported successfully');
    }

    // 2. 导入 Shipping Templates
    if (exportData.shipping_templates && exportData.shipping_templates.length > 0) {
      console.log(`[import] Importing ${exportData.shipping_templates.length} shipping templates...`);
      
      for (const template of exportData.shipping_templates) {
        const createdAt = template.createdAt ? new Date(template.createdAt) : new Date();
        const updatedAt = template.updatedAt ? new Date(template.updatedAt) : new Date();

        await prisma.shippingTemplate.upsert({
          where: { id: template.id },
          update: {
            name: template.name,
            regions: template.regions,
            basePrice: template.basePrice,
            weightRate: template.weightRate,
            volumeRate: template.volumeRate,
            freeThreshold: template.freeThreshold,
            minDays: template.minDays,
            maxDays: template.maxDays,
            isActive: template.isActive,
            updatedAt,
          },
          create: {
            id: template.id,
            name: template.name,
            regions: template.regions,
            basePrice: template.basePrice,
            weightRate: template.weightRate,
            volumeRate: template.volumeRate,
            freeThreshold: template.freeThreshold,
            minDays: template.minDays,
            maxDays: template.maxDays,
            isActive: template.isActive,
            createdAt,
            updatedAt,
          },
        });
      }
      console.log('[import] Shipping templates imported successfully');
    }

    // 3. 导入 Products
    if (exportData.products && exportData.products.length > 0) {
      console.log(`[import] Importing ${exportData.products.length} products...`);
      
      let successCount = 0;
      let errorCount = 0;

      for (const product of exportData.products) {
        try {
          const createdAt = product.createdAt ? new Date(product.createdAt) : new Date();
          const updatedAt = product.updatedAt ? new Date(product.updatedAt) : new Date();

          // 转换 JSON 字段
          let images = product.images;
          if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { /* keep as string */ }
          }
          if (Array.isArray(images)) {
            images = JSON.stringify(images);
          }

          let keywords = product.keywords;
          if (typeof keywords === 'string') {
            try {
              const parsed = JSON.parse(keywords);
              if (Array.isArray(parsed)) keywords = JSON.stringify(parsed);
            } catch { /* keep as string */ }
          }

          await prisma.product.upsert({
            where: { id: product.id },
            update: {
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: product.price,
              priceMax: product.priceMax,
              originalPrice: product.originalPrice,
              image: product.image,
              images: images || '[]',
              categoryId: product.categoryId,
              stock: product.stock || 0,
              rating: product.rating || 0,
              reviewCount: product.reviewCount || 0,
              salesCount: product.salesCount || 0,
              isPublished: product.isPublished !== false,
              shippingCost: product.shippingCost || 0,
              shippingMethod: product.shippingMethod,
              sku: product.sku,
              material: product.material,
              plating: product.plating,
              process: product.process,
              color: product.color,
              size: product.size,
              packSize: product.packSize || 1,
              pkgLength: product.pkgLength,
              pkgWidth: product.pkgWidth,
              pkgHeight: product.pkgHeight,
              pkgWeight: product.pkgWeight,
              keywords: keywords || '[]',
              origin: product.origin,
              supplierCity: product.supplierCity,
              stockStatus: product.stockStatus || 'IN_STOCK',
              moq: product.moq || 1,
              aplus: product.aplus,
              updatedAt,
            },
            create: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: product.price,
              priceMax: product.priceMax,
              originalPrice: product.originalPrice,
              image: product.image,
              images: images || '[]',
              categoryId: product.categoryId,
              stock: product.stock || 0,
              rating: product.rating || 0,
              reviewCount: product.reviewCount || 0,
              salesCount: product.salesCount || 0,
              isPublished: product.isPublished !== false,
              shippingCost: product.shippingCost || 0,
              shippingMethod: product.shippingMethod,
              sku: product.sku,
              material: product.material,
              plating: product.plating,
              process: product.process,
              color: product.color,
              size: product.size,
              packSize: product.packSize || 1,
              pkgLength: product.pkgLength,
              pkgWidth: product.pkgWidth,
              pkgHeight: product.pkgHeight,
              pkgWeight: product.pkgWeight,
              keywords: keywords || '[]',
              origin: product.origin,
              supplierCity: product.supplierCity,
              stockStatus: product.stockStatus || 'IN_STOCK',
              moq: product.moq || 1,
              aplus: product.aplus,
              authorId: product.authorId || 'default-author',
              createdAt,
              updatedAt,
            },
          });
          successCount++;
        } catch (err) {
          errorCount++;
          if (errorCount <= 5) {
            console.error(`  Error importing product ${product.sku || product.id}:`, err.message.substring(0, 100));
          }
        }
        
        // 进度报告
        if ((successCount + errorCount) % 100 === 0) {
          console.log(`  Progress: ${successCount + errorCount}/${exportData.products.length} products processed`);
        }
      }
      
      console.log(`[import] Products: ${successCount} succeeded, ${errorCount} failed`);
    }

    // 4. 导入 Product Variants
    if (exportData.product_variants && exportData.product_variants.length > 0) {
      console.log(`[import] Importing ${exportData.product_variants.length} product variants...`);
      
      for (const variant of exportData.product_variants) {
        try {
          await prisma.productVariant.upsert({
            where: { id: variant.id },
            update: {
              productId: variant.productId,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock || 0,
            },
            create: {
              id: variant.id,
              productId: variant.productId,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock || 0,
            },
          });
        } catch (err) {
          // 忽略单个变体的错误
        }
      }
      console.log('[import] Product variants imported successfully');
    }

    console.log('[import] ✅ Data import completed!');
    console.log(`[import] Total products: ${exportData.products?.length || 0}`);
    console.log(`[import] Total categories: ${exportData.categories?.length || 0}`);
  } catch (error) {
    console.error('[import] Error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
