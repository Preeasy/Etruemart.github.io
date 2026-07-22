import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Plus, Image, DollarSign, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const Sell = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=800&fit=crop',
    images: [] as string[],
    categoryId: '',
    stock: '',
    material: '',
    plating: '',
    process: '',
    color: '',
    size: '',
    packSize: '',
    pkgLength: '',
    pkgWidth: '',
    pkgHeight: '',
    pkgWeight: '',
    keywords: '',
    stockStatus: 'IN_STOCK',
    moq: '',
    variants: [{ color: '', size: '', price: '', stock: '' }],
  });

  useEffect(() => {
    if (session?.user) {
      fetch('/api/categories?level=1')
        .then(res => res.json())
        .then(data => {
          let cats: CategoryOption[] = data;
          // Non-ADMIN users can only select their allowedCategoryId
          if (session.user.role !== 'ADMIN' && session.user.allowedCategoryId) {
            cats = cats.filter(c => c.id === session.user.allowedCategoryId);
            if (cats.length === 1) {
              setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
            }
          }
          setCategories(cats);
        })
        .catch(() => {});
    }
  }, [session?.user]);

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      packSize: formData.packSize ? parseInt(formData.packSize) : undefined,
      moq: formData.moq ? parseInt(formData.moq) : undefined,
      pkgLength: formData.pkgLength ? parseFloat(formData.pkgLength) : undefined,
      pkgWidth: formData.pkgWidth ? parseFloat(formData.pkgWidth) : undefined,
      pkgHeight: formData.pkgHeight ? parseFloat(formData.pkgHeight) : undefined,
      pkgWeight: formData.pkgWeight ? parseFloat(formData.pkgWeight) : undefined,
    };
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push('/dashboard');
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { color: '', size: '', price: '', stock: '' }],
    });
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const variants = [...formData.variants];
    variants[index] = { ...variants[index], [field]: value };
    setFormData({ ...formData, variants });
  };

  const isCategoryLocked = session?.user?.role !== 'ADMIN' && !!session?.user?.allowedCategoryId;

  return (
    <Layout>
      <div className="bg-dark-800 border-b border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-dark-50">List a New Product</h1>
          <p className="text-dark-300 mt-1">Start selling to customers worldwide</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl shadow-lg p-8 space-y-6 border border-dark-500/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    required
                    disabled={isCategoryLocked}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {isCategoryLocked && (
                    <p className="mt-1 text-xs text-dark-400">Your account is restricted to a specific category</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                  placeholder="Describe your product in detail..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 pl-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Original Price (Optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-3 pl-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* New product fields */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="e.g., Stainless Steel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Plating</label>
                  <input
                    type="text"
                    value={formData.plating}
                    onChange={(e) => setFormData({ ...formData, plating: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="e.g., Gold Plated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Process</label>
                  <input
                    type="text"
                    value={formData.process}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="e.g., Die Casting"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="e.g., Silver"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="e.g., M/L/XL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Pack Size</label>
                  <input
                    type="number"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Pkg Length (cm)</label>
                  <input
                    type="number"
                    value={formData.pkgLength}
                    onChange={(e) => setFormData({ ...formData, pkgLength: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Pkg Width (cm)</label>
                  <input
                    type="number"
                    value={formData.pkgWidth}
                    onChange={(e) => setFormData({ ...formData, pkgWidth: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Pkg Height (cm)</label>
                  <input
                    type="number"
                    value={formData.pkgHeight}
                    onChange={(e) => setFormData({ ...formData, pkgHeight: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Pkg Weight (g)</label>
                  <input
                    type="number"
                    value={formData.pkgWeight}
                    onChange={(e) => setFormData({ ...formData, pkgWeight: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">MOQ</label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="e.g., necklace, fashion, wholesale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Stock Status</label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="PRE_ORDER">Pre-Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Main Image URL</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 pl-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-dark-400">Use an image URL from Unsplash or your hosting</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Variants (Optional)</label>
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-dark-700/50 rounded-lg border border-dark-500/20">
                      <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1">Color</label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-700 border border-dark-500/30 rounded-lg text-sm text-dark-50"
                          placeholder="e.g., Black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1">Size</label>
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-700 border border-dark-500/30 rounded-lg text-sm text-dark-50"
                          placeholder="e.g., M"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1">Price</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-700 border border-dark-500/30 rounded-lg text-sm text-dark-50"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-700 border border-dark-500/30 rounded-lg text-sm text-dark-50"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="mt-3 flex items-center gap-2 text-primary-500 hover:text-primary-400 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold py-3 rounded-lg transition-colors"
                >
                  Publish Product
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border border-dark-500/30 text-dark-200 font-semibold rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-500/20">
              <h3 className="font-semibold text-dark-50 mb-4">Selling Tips</h3>
              <ul className="space-y-3 text-sm text-dark-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>Use high-quality images for better visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>Write detailed descriptions to help buyers</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>Offer competitive pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>Keep stock updated to avoid cancellations</span>
                </li>
              </ul>
            </div>

            <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-500/20">
              <h3 className="font-semibold text-dark-50 mb-4">Ready to Sell?</h3>
              <p className="text-sm text-dark-300 mb-4">
                Join thousands of sellers who trust eTruemart. Start selling today and reach customers worldwide.
              </p>
              <Link href="/dashboard" className="btn-primary w-full block text-center">
                View Your Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sell;

export const getServerSideProps = () => ({ props: {} });
