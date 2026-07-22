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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => {});
  }, []);

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
    { icon: Package, label: 'Products', value: products.length, color: 'bg-primary-100 text-primary-600' },
    { icon: ShoppingCart, label: 'Orders', value: orders.length, color: 'bg-accent-100 text-accent-600' },
    { icon: DollarSign, label: 'Total Sales', value: '$0.00', color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: 'Published', value: products.filter(p => p.isPublished).length, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <Layout>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {session.user.name}</p>
            </div>
            <Link href="/sell" className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              <Plus className="w-5 h-5" />
              List Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Product Management</h2>
            <Link href="/sell" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              + Add New
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">MOQ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Shipping</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-400">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">${Number(product.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {editingProduct === product.id ? (
                          <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-20 px-2 py-1 border rounded text-sm" />
                        ) : product.stock}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {editingProduct === product.id ? (
                          <input type="number" value={editForm.moq} onChange={e => setEditForm({...editForm, moq: e.target.value})} className="w-20 px-2 py-1 border rounded text-sm" />
                        ) : product.moq}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {editingProduct === product.id ? (
                          <div className="space-y-1">
                            <input type="number" value={editForm.shippingCost} onChange={e => setEditForm({...editForm, shippingCost: e.target.value})} className="w-20 px-2 py-1 border rounded text-sm" placeholder="Cost" />
                            <select value={editForm.shippingMethod} onChange={e => setEditForm({...editForm, shippingMethod: e.target.value})} className="w-full px-2 py-1 border rounded text-sm">
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
                            <p className="text-xs text-gray-400">{product.shippingMethod || 'Standard'}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {product.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {editingProduct === product.id ? (
                            <>
                              <button onClick={() => saveEdit(product.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingProduct(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded" title="Cancel">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => togglePublish(product.id, product.isPublished)} className={`p-1.5 rounded ${product.isPublished ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`} title={product.isPublished ? 'Unpublish' : 'Publish'}>
                                {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button onClick={() => startEdit(product)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded" title="Edit shipping & stock">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
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
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven&apos;t listed any products yet.</p>
              <Link href="/sell" className="btn-primary">
                List Your First Product
              </Link>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{order.items?.length || 0} items</span>
                      <span className="font-semibold text-gray-900">${order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet.</p>
              </div>
            )}
          </div>

          <div className="bg-primary-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/sell" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">List New Product</span>
              </Link>
              <Link href="/orders" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                <ShoppingCart className="w-5 h-5 text-accent-600" />
                <span className="text-gray-700">Manage Orders</span>
              </Link>
              <Link href="/products" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">View All Products</span>
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
