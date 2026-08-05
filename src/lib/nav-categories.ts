import seedData from '../../prisma/seed-data.json';

interface CategoryItem {
  id: string | number;
  slug: string;
  name: string;
  children: { id: string | number; slug: string; name: string }[];
  productCount: number;
}

const products: any[] = seedData.products;
const categories: any[] = seedData.categories;

const productCountByCat: Record<string, number> = {};
for (const p of products) {
  const catId = p.categoryId;
  if (!catId) continue;
  productCountByCat[catId] = (productCountByCat[catId] || 0) + 1;
}

const rootCategories = categories
  .filter(c => !c.parentId)
  .sort((a, b) => {
    const ca = productCountByCat[a.id] || 0;
    const cb = productCountByCat[b.id] || 0;
    return cb - ca;
  });

const navCategories: CategoryItem[] = rootCategories.map(root => {
  const children = categories
    .filter(c => c.parentId === root.id)
    .sort((a, b) => (productCountByCat[a.id] || 0) - (productCountByCat[b.id] || 0))
    .map(c => ({ id: c.id, slug: c.slug, name: c.name }));

  return {
    id: root.id,
    slug: root.slug,
    name: root.name,
    children,
    productCount: productCountByCat[root.id] || 0,
  };
});

export default navCategories;
