import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, ShoppingCart, FileText, Settings, TrendingUp, DollarSign, PackageOpen, Plus } from 'lucide-react';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

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
      .then(data => setOrders(data));
  }, []);

  const stats = [
    { icon: PackageOpen, label: 'Active Products', value: products.length, color: 'bg-primary-100 text-primary-600' },
    { icon: ShoppingCart, label: 'Orders', value: orders.length, color: 'bg-accent-100 text-accent-600' },
    { icon: DollarSign, label: 'Total Sales', value: '$0.00', color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: 'Growth', value: '+12%', color: 'bg-purple-100 text-purple-600' },
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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
                <Link href="/sell" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>

              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">${product.price}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            In Stock: {product.stock}
                          </span>
                          <span className="text-xs text-gray-500">{product.salesCount} sold</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Package className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
                  <Link href="/sell" className="btn-primary">
                    List Your First Product
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <Link href="/orders" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>

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
                        <span className="text-sm text-gray-500">{order.items.length} items</span>
                        <span className="font-semibold text-gray-900">${order.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet.</p>
                </div>
              )}
            </div>

            <div className="bg-primary-50 rounded-2xl p-6 mt-6">
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
                <button className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

export const getServerSideProps = () => ({ props: {} });
