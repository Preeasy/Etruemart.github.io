import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, EyeOff, Edit3, Trash2, Truck, Save, X } from 'lucide-react';
import Layout from '@/components/Layout';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  salesCount: number;
  isPublished: boolean;
  category: string;
  shippingCost: number;
  shippingMethod: string;
  sku: string | null;
  material: string | null;
  moq: number;
}

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ shippingCost: '', shippingMethod: '', stock: '', moq: '' });

  if (!session) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (session?.user?.id) {
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
    { icon: Package, label: 'My Products', value: products.length, color: 'bg-primary-800/50 text-accent-500 border border-primary-700/30' },
    { icon: ShoppingCart, label: 'Orders', value: orders.length, color: 'bg-primary-800/50 text-primary-400 border border-primary-700/30' },
    { icon: DollarSign, label: 'Total Sales', value: '$0.00', color: 'bg-primary-800/50 text-accent-500 border border-primary-700/30' },
    { icon: TrendingUp, label: 'Published', value: products.filter(p => p.isPublished).length, color: 'bg-primary-800/50 text-primary-400 border border-primary-700/30' },
  ];

  return (
    <Layout>
      <div className="bg-dark-800 border-b border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-50">Seller Dashboard</h1>
              <p className="text-dark-300 mt-1">Welcome back, {session.user.name}</p>
            </div>
            <Link href="/sell" className="flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-dark-900 px-6 py-3 rounded-lg font-bold transition-colors">
              <Plus className="w-5 h-5" />
              List Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-dark-800 rounded-xl p-6 shadow-lg border border-dark-500/20">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-dark-50">{stat.value}</div>
              <div className="text-sm text-dark-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-dark-800 rounded-2xl shadow-lg p-6 mb-8 border border-dark-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark-50">My Product Management</h2>
            <Link href="/sell" className="text-accent-500 hover:text-accent-400 font-medium text-sm">
              + Add New
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-500/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">MOQ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Shipping</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-dark-500/10 hover:bg-dark-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <p className="font-medium text-dark-50 text-sm line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-dark-500">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-300">{product.category}</td>
                      <td className="py-3 px-4 text-sm font-medium text-accent-500">${Number(product.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-dark-300">
                        {editingProduct === product.id ? (
                          <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-20 px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-dark-50" />
                        ) : product.stock}
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-300">
                        {editingProduct === product.id ? (
                          <input type="number" value={editForm.moq} onChange={e => setEditForm({...editForm, moq: e.target.value})} className="w-20 px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-dark-50" />
                        ) : product.moq}
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-300">
                        {editingProduct === product.id ? (
                          <div className="space-y-1">
                            <input type="number" value={editForm.shippingCost} onChange={e => setEditForm({...editForm, shippingCost: e.target.value})} className="w-20 px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-dark-50" placeholder="Cost" />
                            <select value={editForm.shippingMethod} onChange={e => setEditForm({...editForm, shippingMethod: e.target.value})} className="w-full px-2 py-1 bg-dark-700 border border-dark-500/30 rounded text-sm text-dark-50">
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isPublished ? 'bg-primary-800/50 text-accent-500 border border-primary-700/30' : 'bg-dark-700 text-dark-400 border border-dark-500/30'}`}>
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
                              <button onClick={() => setEditingProduct(null)} className="p-1.5 text-dark-400 hover:bg-dark-700 rounded" title="Cancel">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => togglePublish(product.id, product.isPublished)} className={`p-1.5 rounded ${product.isPublished ? 'text-orange-500 hover:bg-orange-500/10' : 'text-green-500 hover:bg-green-500/10'}`} title={product.isPublished ? 'Unpublish' : 'Publish'}>
                                {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button onClick={() => startEdit(product)} className="p-1.5 text-accent-500 hover:bg-accent-500/10 rounded" title="Edit shipping & stock">
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
              <p className="text-dark-400 mb-4">You haven&apos;t listed any products yet.</p>
              <Link href="/sell" className="btn-primary">
                List Your First Product
              </Link>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-dark-800 rounded-2xl shadow-lg p-6 border border-dark-500/20">
            <h2 className="text-xl font-bold text-dark-50 mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 bg-dark-700/50 rounded-xl border border-dark-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-dark-50">Order #{order.id.slice(-8)}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'PAID' ? 'bg-primary-800/50 text-accent-500 border border-primary-700/30' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-400">{order.items?.length || 0} items</span>
                      <span className="font-semibold text-accent-500">${order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                <p className="text-dark-400">No orders yet.</p>
              </div>
            )}
          </div>

          <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-500/20">
            <h3 className="font-semibold text-dark-50 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/sell" className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-500/20">
                <Package className="w-5 h-5 text-accent-500" />
                <span className="text-dark-200">List New Product</span>
              </Link>
              <Link href="/orders" className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-500/20">
                <ShoppingCart className="w-5 h-5 text-primary-400" />
                <span className="text-dark-200">Manage Orders</span>
              </Link>
              <Link href="/products" className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-500/20">
                <Truck className="w-5 h-5 text-primary-400" />
                <span className="text-dark-200">View All Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

export const getServerSideProps = () => ({ props: {} });
