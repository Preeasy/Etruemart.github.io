import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, EyeOff, Edit3, Trash2, Truck, Save, X, Upload, Download, FileJson, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  salesCount: number;
  isPublished: boolean;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  shippingCost: number;
  shippingMethod: string;
  sku: string | null;
  material: string | null;
  moq: number;
  packSize: number;
  stockStatus: string;
}

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ shippingCost: '', shippingMethod: '', stock: '', moq: '' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  if (!session) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (session?.user?.id) {
      // Always fetch only the current user's products
      fetch(`/api/products?authorId=${session.user.id}`)
        .then(res => res.json())
        .then(data => setProducts(data));
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(() => {});
    }
  }, [session?.user?.id]);

  const togglePublish = async (productId: string, currentStatus: boolean) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !currentStatus }),
    });
    if (res.ok) {
      setProducts(products.map(p => p.id === productId ? { ...p, isPublished: !currentStatus } : p));
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const startEdit = (product: ProductItem) => {
    setEditingProduct(product.id);
    setEditForm({
      shippingCost: String(Number(product.shippingCost)),
      shippingMethod: product.shippingMethod || '',
      stock: String(product.stock),
      moq: String(product.moq),
    });
  };

  const saveEdit = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingCost: editForm.shippingCost,
        shippingMethod: editForm.shippingMethod,
        stock: editForm.stock,
        moq: editForm.moq,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(products.map(p => p.id === productId ? { ...p, shippingCost: Number(updated.shippingCost), shippingMethod: updated.shippingMethod, stock: updated.stock, moq: updated.moq } : p));
      setEditingProduct(null);
    }
  };

  const stats = [
    { icon: Package, label: 'My Products', value: products.length, color: 'bg-gold-800/50 text-gold-500 border border-gold-700/30' },
    { icon: ShoppingCart, label: 'Orders', value: orders.length, color: 'bg-gold-800/50 text-gold-600 border border-gold-700/30' },
    { icon: DollarSign, label: 'Total Sales', value: '$0.00', color: 'bg-gold-800/50 text-gold-500 border border-gold-700/30' },
    { icon: TrendingUp, label: 'Published', value: products.filter(p => p.isPublished).length, color: 'bg-gold-800/50 text-gold-600 border border-gold-700/30' },
  ];

  const stockStatusLabel: Record<string, string> = {
    IN_STOCK: 'In Stock',
    LOW_STOCK: 'Low Stock',
    OUT_OF_STOCK: 'Out of Stock',
    PRE_ORDER: 'Pre-Order',
  };

  const stockStatusColor: Record<string, string> = {
    IN_STOCK: 'bg-green-500/10 text-green-500 border border-green-500/30',
    LOW_STOCK: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
    OUT_OF_STOCK: 'bg-red-500/10 text-red-500 border border-red-500/30',
    PRE_ORDER: 'bg-blue-500/10 text-blue-500 border border-blue-500/30',
  };

  return (
    <Layout>
      <div className="bg-gray-50 border-b border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {session.user.name}</p>
            </div>
            <Link href="/sell" className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-3 rounded-lg font-bold transition-colors">
              <Plus className="w-5 h-5" />
              List Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-dark-500/20">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl shadow-lg p-6 mb-8 border border-dark-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Product Management</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-dark-500/30">
                <Upload className="w-4 h-4" />
                Batch Import
              </button>
              <Link href="/sell" className="text-gold-500 hover:text-gold-500 font-medium text-sm">
                + Add New
              </Link>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-500/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">MOQ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pack Size</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Material</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Shipping</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Published</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-dark-500/10 hover:bg-dark-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-dark-500">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{product.category?.name ?? '-'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gold-500">${Number(product.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {editingProduct === product.id ? (
                          <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-20 px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-gray-900" />
                        ) : product.stock}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {editingProduct === product.id ? (
                          <input type="number" value={editForm.moq} onChange={e => setEditForm({...editForm, moq: e.target.value})} className="w-20 px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-gray-900" />
                        ) : product.moq}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{product.packSize}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{product.material ?? '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatusColor[product.stockStatus] || 'bg-dark-700 text-gray-500 border border-dark-500/30'}`}>
                          {stockStatusLabel[product.stockStatus] || product.stockStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {editingProduct === product.id ? (
                          <div className="space-y-1">
                            <input type="number" value={editForm.shippingCost} onChange={e => setEditForm({...editForm, shippingCost: e.target.value})} className="w-20 px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-gray-900" placeholder="Cost" />
                            <select value={editForm.shippingMethod} onChange={e => setEditForm({...editForm, shippingMethod: e.target.value})} className="w-full px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-gray-900">
                              <option value="Standard Shipping">Standard</option>
                              <option value="Express Shipping">Express</option>
                              <option value="Air Freight">Air Freight</option>
                              <option value="Sea Freight">Sea Freight</option>
                              <option value="Free Shipping">Free</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <p>${Number(product.shippingCost).toFixed(2)}</p>
                            <p className="text-xs text-dark-500">{product.shippingMethod || 'Standard'}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isPublished ? 'bg-gold-800/50 text-gold-500 border border-gold-700/30' : 'bg-dark-700 text-gray-500 border border-dark-500/30'}`}>
                          {product.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {editingProduct === product.id ? (
                            <>
                              <button onClick={() => saveEdit(product.id)} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded" title="Save">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingProduct(null)} className="p-1.5 text-gray-500 hover:bg-dark-700 rounded" title="Cancel">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => togglePublish(product.id, product.isPublished)} className={`p-1.5 rounded ${product.isPublished ? 'text-orange-500 hover:bg-orange-500/10' : 'text-green-500 hover:bg-green-500/10'}`} title={product.isPublished ? 'Unpublish' : 'Publish'}>
                                {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button onClick={() => startEdit(product)} className="p-1.5 text-gold-500 hover:bg-gold-500/10 rounded" title="Edit shipping & stock">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-dark-500 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven&apos;t listed any products yet.</p>
              <Link href="/sell" className="btn-primary">
                List Your First Product
              </Link>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl shadow-lg p-6 border border-dark-500/20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 bg-dark-700/50 rounded-xl border border-dark-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'PAID' ? 'bg-gold-800/50 text-gold-500 border border-gold-700/30' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{order.items?.length || 0} items</span>
                      <span className="font-semibold text-gold-500">${order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet.</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-dark-500/20">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/sell" className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-500/20">
                <Package className="w-5 h-5 text-gold-500" />
                <span className="text-gray-600">List New Product</span>
              </Link>
              <Link href="/orders" className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-500/20">
                <ShoppingCart className="w-5 h-5 text-gold-600" />
                <span className="text-gray-600">Manage Orders</span>
              </Link>
              <Link href="/products" className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-500/20">
                <Truck className="w-5 h-5 text-gold-600" />
                <span className="text-gray-600">View All Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl border border-dark-500/30 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-dark-500/30">
              <h3 className="text-xl font-bold text-gray-900">Batch Import Products</h3>
              <button onClick={() => { setShowImportModal(false); setImportFile(null); setImportResult(null); setImportProgress(0); }} className="p-2 hover:bg-dark-700 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-dark-700/50 rounded-xl p-6 border border-dark-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <FileJson className="w-6 h-6 text-gold-500" />
                    <h4 className="font-semibold text-gray-900">Supported Format</h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Upload a JSON file with product data. The file should contain an array of products with the following structure:</p>
                  <pre className="bg-white rounded-lg p-4 text-xs text-gray-500 overflow-x-auto">
{`{
  "products": [
    {
      "name": "Product Name",
      "description": "Product description",
      "slug": "product-slug",
      "priceMin": 0.5,
      "priceMax": 2.0,
      "image": "https://...",
      "images": ["img1", "img2", "..."],
      "categorySlug": "necklaces",
      "material": "Zinc Alloy",
      "plating": "Gold Plated",
      "color": "Gold",
      "packSize": 12,
      "pkgLength": 30,
      "pkgWidth": 20,
      "pkgHeight": 5,
      "pkgWeight": 0.2,
      "moq": 10,
      "stockStatus": "IN_STOCK",
      "keywords": ["wholesale", "yiwu"]
    }
  ]
}`}
                  </pre>
                </div>

                <div className="bg-dark-700/50 rounded-xl p-6 border border-dark-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-gold-600" />
                    <h4 className="font-semibold text-gray-900">Field Requirements</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-500">name, description, slug (required)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-500">priceMin, priceMax, image</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-500">images (array, 6 images recommended)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-500">categorySlug (must match existing category)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="text-gray-500">material, plating, process (optional)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="text-gray-500">packSize, pkgLength/Width/Height/Weight</span>
                    </div>
                  </div>
                </div>

                <div className="border border-dashed border-dark-500/30 rounded-xl p-8 text-center hover:border-gold-500/30 transition-colors cursor-pointer" onClick={() => document.getElementById('import-file')?.click()} onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file && file.type === 'application/json') setImportFile(file); }}>
                  <input id="import-file" type="file" accept=".json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setImportFile(file); }} />
                  <Upload className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  {importFile ? (
                    <div className="text-gray-900 font-medium">{importFile.name}</div>
                  ) : (
                    <>
                      <p className="text-gray-900 font-medium mb-2">Drag &amp; drop your JSON file here</p>
                      <p className="text-gray-500 text-sm">or click to browse</p>
                    </>
                  )}
                </div>

                {importLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Importing products...</span>
                      <span className="text-gold-500">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-gold-500 h-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {importResult && (
                  <div className={`rounded-xl p-4 ${importResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {importResult.success ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                      <span className={`font-medium ${importResult.success ? 'text-green-500' : 'text-red-500'}`}>{importResult.message}</span>
                    </div>
                    {importResult.data && (
                      <div className="text-sm space-y-1">
                        <p className="text-gray-500">Total: {importResult.data.total}</p>
                        <p className="text-green-500">Success: {importResult.data.success}</p>
                        <p className="text-red-500">Failed: {importResult.data.failed}</p>
                        {importResult.data.errors && importResult.data.errors.length > 0 && (
                          <div className="mt-3 max-h-32 overflow-y-auto">
                            {importResult.data.errors.slice(0, 5).map((err: string, i: number) => (
                              <p key={i} className="text-xs text-gray-500">{err}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/api/products/sample';
                    link.download = 'sample-products.json';
                    link.click();
                  }} className="flex-1 flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 text-gray-600 px-6 py-3 rounded-lg font-medium transition-colors border border-dark-500/30">
                    <Download className="w-5 h-5" />
                    Download Sample File
                  </button>
                  <button onClick={async () => {
                    if (!importFile) return;
                    setImportLoading(true);
                    setImportProgress(0);
                    setImportResult(null);

                    try {
                      const text = await importFile.text();
                      const json = JSON.parse(text);
                      const productsData = json.products || json;

                      setImportProgress(20);

                      const res = await fetch('/api/products/batch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data: productsData }),
                      });

                      setImportProgress(100);

                      const result = await res.json();

                      if (res.ok) {
                        setImportResult({ success: true, message: 'Import completed successfully!', data: result });
                        fetch(`/api/products?authorId=${session?.user?.id}`)
                          .then(res => res.json())
                          .then(data => setProducts(data));
                      } else {
                        setImportResult({ success: false, message: result.error || 'Import failed' });
                      }
                    } catch (error) {
                      setImportResult({ success: false, message: 'Error parsing file or uploading' });
                    } finally {
                      setImportLoading(false);
                    }
                  }} disabled={!importFile || importLoading} className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    {importLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {importLoading ? 'Importing...' : 'Start Import'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;

export const getServerSideProps = () => ({ props: {} });
