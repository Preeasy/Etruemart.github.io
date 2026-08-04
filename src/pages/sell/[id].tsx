import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
  Package,
  Image,
  DollarSign,
  ChevronRight,
  Save,
  X,
  Trash2,
  Plus,
  Loader2,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import Layout from '@/components/Layout';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceMax: number | null;
  originalPrice: number | null;
  image: string;
  images: string[];
  categoryId: string | null;
  categoryName: string;
  stock: number;
  isPublished: boolean;
  shippingCost: number;
  shippingMethod: string;
  sku: string | null;
  material: string | null;
  plating: string | null;
  process: string | null;
  color: string | null;
  size: string | null;
  packSize: number;
  moq: number;
  pkgLength: number | null;
  pkgWidth: number | null;
  pkgHeight: number | null;
  pkgWeight: number | null;
  keywords: string[];
  stockStatus: string;
  authorId: string;
  aplus: AplusContent | null;
}

interface AplusBlock {
  id: string;
  type: 'image' | 'text' | 'banner' | 'comparison';
  content: string;
  caption?: string;
}

interface AplusContent {
  blocks: AplusBlock[];
  description: string;
  bulletPoints: string[];
}

const ProductEditPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'shipping' | 'aplus'>('basic');
  const [newAplusBlock, setNewAplusBlock] = useState<{ type: AplusBlock['type']; content: string; caption: string }>({ type: 'image', content: '', caption: '' });

  useEffect(() => {
    if (!id || !session?.user) return;

    const uid = session.user.id;
    const role = (session.user as any).role || '';

    fetch(`/api/products/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();

        const canManage = role === 'ADMIN';
        if (data.authorId !== uid && !canManage) {
          throw new Error('Forbidden: Only administrators can edit products');
        }

        const parsed: ProductData = {
          id: data.id,
          name: data.name,
          slug: data.slug || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          priceMax: data.priceMax ? Number(data.priceMax) : null,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
          image: data.image || '',
          images: Array.isArray(data.images) ? data.images : [],
          categoryId: data.categoryId || null,
          categoryName: data.categoryName || data.category?.name || '',
          stock: data.stock ?? 0,
          isPublished: data.isPublished ?? true,
          shippingCost: Number(data.shippingCost) || 0,
          shippingMethod: data.shippingMethod || 'Standard Shipping',
          sku: data.sku || null,
          material: data.material || null,
          plating: data.plating || null,
          process: data.process || null,
          color: data.color || null,
          size: data.size || null,
          packSize: data.packSize ?? 1,
          moq: data.moq ?? 1,
          pkgLength: data.pkgLength ? Number(data.pkgLength) : null,
          pkgWidth: data.pkgWidth ? Number(data.pkgWidth) : null,
          pkgHeight: data.pkgHeight ? Number(data.pkgHeight) : null,
          pkgWeight: data.pkgWeight ? Number(data.pkgWeight) : null,
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
          stockStatus: data.stockStatus || 'IN_STOCK',
          authorId: data.authorId,
          aplus: data.aplus || null,
        };
        setProduct(parsed);
      })
      .catch((err) => setErrorMsg(err.message || 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, session?.user, sessionStatus]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/categories?level=1')
        .then((res) => res.json())
        .then((data: CategoryOption[]) => {
          let cats = data;
          if (session.user.role !== 'ADMIN' && session.user.allowedCategoryId) {
            cats = cats.filter((c) => c.id === session.user.allowedCategoryId);
          }
          setCategories(cats);
        })
        .catch(() => {});
    }
  }, [session?.user]);

  if (sessionStatus === 'loading' || !session) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  // Only admins can edit products (site policy)
  if ((session.user as any).role !== 'ADMIN') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <ShieldAlert className="w-12 h-12 text-ink-300 mb-3" />
          <p className="text-lg font-bold text-navy-800 mb-1">Admin access required</p>
          <p className="text-sm text-ink-500">Only administrators can edit products. Contact an admin if you need access.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-accent-500 animate-spin mx-auto mb-4" />
            <p className="text-ink-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (errorMsg || !product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{errorMsg || 'Product not found'}</p>
            <Link href="/products" className="inline-flex items-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600">
              ← Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const updateField = (field: string, value: any) => {
    setProduct((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!product.images.includes(url)) {
      updateField('images', [...product.images, url]);
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = product.images.filter((_, i) => i !== index);
    updateField('images', newImages);
    if (index === 0 && newImages.length > 0) {
      updateField('image', newImages[0]);
    }
  };

  const handleSetMainImage = (index: number) => {
    const img = product.images[index];
    updateField('image', img);
    const newImages = [img, ...product.images.filter((_, i) => i !== index)];
    updateField('images', newImages);
  };

  const handleAddKeyword = (kw: string) => {
    if (!kw.trim()) return;
    const k = kw.trim();
    if (!product.keywords.includes(k)) {
      updateField('keywords', [...product.keywords, k]);
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    updateField('keywords', product.keywords.filter((k) => k !== kw));
  };

  const handleAddAplusBlock = () => {
    if (!newAplusBlock.content.trim()) return;
    const block: AplusBlock = {
      id: `block-${Date.now()}`,
      type: newAplusBlock.type,
      content: newAplusBlock.content.trim(),
      caption: newAplusBlock.caption.trim() || undefined,
    };
    const current = product.aplus || { blocks: [], description: '', bulletPoints: [] };
    updateField('aplus', { ...current, blocks: [...current.blocks, block] });
    setNewAplusBlock({ type: 'image', content: '', caption: '' });
  };

  const handleRemoveAplusBlock = (blockId: string) => {
    const current = product.aplus;
    if (!current) return;
    updateField('aplus', { ...current, blocks: current.blocks.filter((b) => b.id !== blockId) });
  };

  const handleMoveAplusBlock = (blockId: string, dir: 'up' | 'down') => {
    const current = product.aplus;
    if (!current) return;
    const idx = current.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= current.blocks.length) return;
    const blocks = [...current.blocks];
    [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
    updateField('aplus', { ...current, blocks });
  };

  const handleAddAplusBullet = (bullet: string) => {
    if (!bullet.trim()) return;
    const current = product.aplus || { blocks: [], description: '', bulletPoints: [] };
    updateField('aplus', { ...current, bulletPoints: [...current.bulletPoints, bullet.trim()] });
  };

  const handleRemoveAplusBullet = (bullet: string) => {
    const current = product.aplus;
    if (!current) return;
    updateField('aplus', { ...current, bulletPoints: current.bulletPoints.filter((b) => b !== bullet) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        images: product.images,
        categoryId: product.categoryId,
        stock: product.stock,
        isPublished: product.isPublished,
        shippingCost: product.shippingCost,
        shippingMethod: product.shippingMethod,
        sku: product.sku,
        material: product.material,
        plating: product.plating,
        process: product.process,
        color: product.color,
        size: product.size,
        packSize: product.packSize,
        moq: product.moq,
        pkgLength: product.pkgLength,
        pkgWidth: product.pkgWidth,
        pkgHeight: product.pkgHeight,
        pkgWeight: product.pkgWeight,
        keywords: product.keywords,
        stockStatus: product.stockStatus,
        aplus: product.aplus,
      };

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save product');
      }

      router.push('/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isCategoryLocked =
    session?.user?.role !== 'ADMIN' && !!session?.user?.allowedCategoryId;

  const tabs = [
    { key: 'basic' as const, label: 'Basic Info' },
    { key: 'images' as const, label: 'Images' },
    { key: 'shipping' as const, label: 'Shipping & Stock' },
    { key: 'aplus' as const, label: 'A+ Content' },
  ];

  return (
    <Layout>
      <Head>
        <title>Edit Product | eTrue Mark Wholesale Platform</title>
      </Head>

      <div className="bg-ink-50 border-b border-ink-200/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 flex items-center gap-3">
                <Edit3 className="w-7 h-7 text-accent-500" />
                Edit Product
              </h1>
              <p className="text-ink-500 mt-1">{product.name}</p>
            </div>
            <Link
              href="/products"
              className="px-4 py-2 border border-ink-200/30 text-ink-700 font-semibold rounded-lg hover:bg-ink-50 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSave}
              className="bg-ink-50 rounded-xl p-8 space-y-6 border border-ink-200/20"
            >
              {/* Tabs */}
              <div className="flex border-b border-ink-200/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-medium transition-colors -mb-px border-b-2 ${
                      activeTab === tab.key
                        ? 'border-accent-500 text-accent-600'
                        : 'border-transparent text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Category
                      </label>
                      <select
                        value={product.categoryId || ''}
                        onChange={(e) => updateField('categoryId', e.target.value || null)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        required
                        disabled={isCategoryLocked}
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {isCategoryLocked && (
                        <p className="mt-1 text-xs text-ink-500">
                          Your account is restricted to a specific category
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                      placeholder="Describe your product in detail..."
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Original Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                        <input
                          type="number"
                          value={product.originalPrice ?? ''}
                          onChange={(e) =>
                            updateField(
                              'originalPrice',
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-full px-4 py-3 pl-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        value={product.material || ''}
                        onChange={(e) => updateField('material', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="e.g., Stainless Steel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Plating
                      </label>
                      <input
                        type="text"
                        value={product.plating || ''}
                        onChange={(e) => updateField('plating', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="e.g., Gold Plated"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Process
                      </label>
                      <input
                        type="text"
                        value={product.process || ''}
                        onChange={(e) => updateField('process', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="e.g., Die Casting"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        value={product.color || ''}
                        onChange={(e) => updateField('color', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="e.g., Silver"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Size
                      </label>
                      <input
                        type="text"
                        value={product.size || ''}
                        onChange={(e) => updateField('size', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="e.g., M/L/XL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Pack Size
                      </label>
                      <input
                        type="number"
                        value={product.packSize}
                        onChange={(e) => updateField('packSize', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Pkg Length (cm)
                      </label>
                      <input
                        type="number"
                        value={product.pkgLength ?? ''}
                        onChange={(e) =>
                          updateField('pkgLength', e.target.value ? parseFloat(e.target.value) : null)
                        }
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Pkg Width (cm)
                      </label>
                      <input
                        type="number"
                        value={product.pkgWidth ?? ''}
                        onChange={(e) =>
                          updateField('pkgWidth', e.target.value ? parseFloat(e.target.value) : null)
                        }
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Pkg Height (cm)
                      </label>
                      <input
                        type="number"
                        value={product.pkgHeight ?? ''}
                        onChange={(e) =>
                          updateField(
                            'pkgHeight',
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Pkg Weight (g)
                      </label>
                      <input
                        type="number"
                        value={product.pkgWeight ?? ''}
                        onChange={(e) =>
                          updateField(
                            'pkgWeight',
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        MOQ
                      </label>
                      <input
                        type="number"
                        value={product.moq}
                        onChange={(e) => updateField('moq', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={product.sku || ''}
                        onChange={(e) => updateField('sku', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="SKU-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Stock Status
                      </label>
                      <select
                        value={product.stockStatus}
                        onChange={(e) => updateField('stockStatus', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                      >
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="PRE_ORDER">Pre-Order</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Keywords
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {product.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-ink-100 border border-ink-200/30 rounded-full text-sm text-ink-700"
                          >
                            {kw}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(kw)}
                              className="text-ink-500 hover:text-red-500 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Type a keyword and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Main Image URL
                    </label>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                      <input
                        type="url"
                        value={product.image}
                        onChange={(e) => updateField('image', e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                        placeholder="https://example.com/main-image.jpg"
                        required
                      />
                    </div>
                    {product.image && (
                      <div className="mt-3">
                        <img
                          src={product.image}
                          alt="Main"
                          className="w-40 h-40 object-cover rounded-lg border border-ink-200/30"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Image Gallery ({product.images.length} images)
                    </label>
                    <p className="text-xs text-ink-500 mb-4">
                      Add image URLs to your gallery. The first image will be the main product image.
                    </p>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImage();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="px-4 py-3 bg-accent-500 hover:bg-accent-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {product.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {product.images.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative group rounded-lg overflow-hidden border-2 ${
                                idx === 0 ? 'border-accent-500' : 'border-ink-200/30'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex items-center gap-1">
                                  {idx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetMainImage(idx)}
                                      className="p-2 bg-white/90 rounded-lg text-navy-900 hover:bg-white"
                                      title="Set as main image"
                                    >
                                      <Image className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 bg-accent-500 text-white text-xs px-2 py-0.5 rounded">
                                  Main
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {product.images.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-ink-200/30 rounded-lg">
                          <Image className="w-10 h-10 text-ink-500 mx-auto mb-2" />
                          <p className="text-ink-500 text-sm">No gallery images yet. Add some above.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Shipping Cost
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                        <input
                          type="number"
                          value={product.shippingCost}
                          onChange={(e) =>
                            updateField(
                              'shippingCost',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-4 py-3 pl-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Shipping Method
                      </label>
                      <select
                        value={product.shippingMethod}
                        onChange={(e) => updateField('shippingMethod', e.target.value)}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                      >
                        <option value="Standard Shipping">Standard Shipping</option>
                        <option value="Express Shipping">Express Shipping</option>
                        <option value="Air Freight">Air Freight</option>
                        <option value="Sea Freight">Sea Freight</option>
                        <option value="Free Shipping">Free Shipping</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Status
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="publishStatus"
                            checked={product.isPublished}
                            onChange={() => updateField('isPublished', true)}
                            className="w-4 h-4 text-accent-500"
                          />
                          <span className="text-sm text-ink-700">Published</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="publishStatus"
                            checked={!product.isPublished}
                            onChange={() => updateField('isPublished', false)}
                            className="w-4 h-4 text-accent-500"
                          />
                          <span className="text-sm text-ink-700">Draft</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'aplus' && (
                <div className="space-y-6">
                  <div className="bg-ink-100/50 rounded-lg p-4 border border-ink-200/30">
                    <h3 className="font-semibold text-navy-900 mb-4">A+ Page Content</h3>
                    <p className="text-sm text-ink-500 mb-4">
                      Create an enhanced product page with rich media blocks, comparison charts, and marketing content. A+ content helps increase conversion rates by up to 30%.
                    </p>
                  </div>

                  {/* A+ Description */}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      A+ Description
                    </label>
                    <textarea
                      value={product.aplus?.description || ''}
                      onChange={(e) => {
                        const current = product.aplus || { blocks: [], description: '', bulletPoints: [] };
                        updateField('aplus', { ...current, description: e.target.value });
                      }}
                      rows={4}
                      className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                      placeholder="Write enhanced product description for A+ page..."
                    />
                  </div>

                  {/* Bullet Points */}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Key Selling Points
                    </label>
                    <div className="space-y-3">
                      {product.aplus?.bulletPoints.map((bp, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-white border border-ink-200/30 rounded-lg">
                          <span className="text-ink-500 text-sm flex-1">{bp}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAplusBullet(bp)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="Add a selling point and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAplusBullet((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                      />
                    </div>
                  </div>

                  {/* Content Blocks */}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Content Blocks
                    </label>
                    <p className="text-xs text-ink-500 mb-4">
                      Add image blocks, text blocks, comparison banners to build your A+ page.
                    </p>

                    {/* Add Block Form */}
                    <div className="p-4 bg-white border border-ink-200/30 rounded-lg mb-4">
                      <div className="flex flex-col md:flex-row gap-3">
                        <select
                          value={newAplusBlock.type}
                          onChange={(e) => setNewAplusBlock({ ...newAplusBlock, type: e.target.value as AplusBlock['type'] })}
                          className="px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg text-sm text-navy-900 md:w-36"
                        >
                          <option value="image">Image Block</option>
                          <option value="text">Text Block</option>
                          <option value="banner">Banner</option>
                          <option value="comparison">Comparison</option>
                        </select>
                        <input
                          type="url"
                          value={newAplusBlock.content}
                          onChange={(e) => setNewAplusBlock({ ...newAplusBlock, content: e.target.value })}
                          placeholder={newAplusBlock.type === 'image' ? 'Image URL' : newAplusBlock.type === 'text' ? 'Text content' : 'Content URL or text'}
                          className="flex-1 px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg text-sm text-navy-900"
                        />
                        <input
                          type="text"
                          value={newAplusBlock.caption}
                          onChange={(e) => setNewAplusBlock({ ...newAplusBlock, caption: e.target.value })}
                          placeholder="Caption (optional)"
                          className="px-4 py-3 bg-ink-100 border border-ink-200/30 rounded-lg text-sm text-navy-900 md:w-48"
                        />
                        <button
                          type="button"
                          onClick={handleAddAplusBlock}
                          className="px-4 py-3 bg-accent-500 hover:bg-accent-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Block List */}
                    {product.aplus?.blocks && product.aplus.blocks.length > 0 ? (
                      <div className="space-y-3">
                        {product.aplus.blocks.map((block, idx) => (
                          <div key={block.id} className="p-4 bg-white border border-ink-200/30 rounded-lg">
                            <div className="flex items-start gap-4">
                              {block.type === 'image' ? (
                                <img src={block.content} alt={block.caption || ''} className="w-24 h-24 object-cover rounded-lg border border-ink-200/30" />
                              ) : (
                                <div className="w-24 h-24 bg-ink-100 rounded-lg flex items-center justify-center text-ink-500 text-xs text-center p-2">
                                  {block.type === 'text' ? 'Text' : block.type === 'banner' ? 'Banner' : 'Compare'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-accent-600 uppercase">{block.type}</span>
                                  <span className="text-xs text-ink-400">#{idx + 1}</span>
                                </div>
                                <p className="text-sm text-navy-900 line-clamp-2">{block.content}</p>
                                {block.caption && <p className="text-xs text-ink-500 mt-1">{block.caption}</p>}
                              </div>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => handleMoveAplusBlock(block.id, 'up')} className="p-1.5 text-ink-500 hover:text-navy-700 hover:bg-ink-100 rounded" title="Move up">
                                  <ChevronRight className="w-4 h-4 rotate-90" />
                                </button>
                                <button type="button" onClick={() => handleMoveAplusBlock(block.id, 'down')} className="p-1.5 text-ink-500 hover:text-navy-700 hover:bg-ink-100 rounded" title="Move down">
                                  <ChevronRight className="w-4 h-4 -rotate-90" />
                                </button>
                                <button type="button" onClick={() => handleRemoveAplusBlock(block.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded" title="Remove">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-ink-200/30 rounded-lg">
                        <Package className="w-10 h-10 text-ink-500 mx-auto mb-2" />
                        <p className="text-ink-500 text-sm">No A+ content blocks yet. Add some above.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-ink-200/30">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="px-6 py-3 border border-ink-200/30 text-ink-700 font-semibold rounded-lg hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-ink-50 rounded-xl p-6 border border-ink-200/20">
              <h3 className="font-semibold text-navy-900 mb-4">Current Preview</h3>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-ink-100 rounded-lg flex items-center justify-center mb-4">
                  <Image className="w-12 h-12 text-ink-500" />
                </div>
              )}
              <h4 className="font-medium text-navy-900">{product.name}</h4>
              <p className="text-sm text-ink-500 line-clamp-3 mt-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-accent-600 font-bold text-lg">
                  ${product.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    product.isPublished
                      ? 'bg-accent-100 text-accent-600'
                      : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  {product.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="bg-ink-50 rounded-xl p-6 border border-ink-200/20">
              <h3 className="font-semibold text-navy-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    updateField('isPublished', !product.isPublished)
                  }
                  className="w-full flex items-center gap-3 p-3 bg-ink-100/50 rounded-lg hover:bg-ink-50 transition-colors border border-ink-200/20 text-left"
                >
                  {product.isPublished ? (
                    <>
                      <X className="w-5 h-5 text-orange-500" />
                      <span className="text-ink-700">Unpublish Product</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5 text-green-500" />
                      <span className="text-ink-700">Publish Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-ink-50 rounded-xl p-6 border border-ink-200/20">
              <h3 className="font-semibold text-navy-900 mb-4">Editing Tips</h3>
              <ul className="space-y-3 text-sm text-ink-500">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-accent-600 flex-shrink-0" />
                  <span>Use clear, high-quality images for better conversion</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-accent-600 flex-shrink-0" />
                  <span>Keep descriptions detailed and accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-accent-600 flex-shrink-0" />
                  <span>First gallery image is the main product image</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-accent-600 flex-shrink-0" />
                  <span>Use relevant keywords for search optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductEditPage;
