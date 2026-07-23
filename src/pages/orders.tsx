import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FileText, Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: { product: { id: string; name: string; image: string }; quantity: number; price: number }[];
}

const Orders = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (session) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(data));
    }
  }, [session]);

  if (!session) {
    router.push('/login');
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'SHIPPED': return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'DELIVERED': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      default: return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Paid';
      case 'SHIPPED': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusIcon(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</span>
                          <span className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{order.items.length} items</p>
                        <p className="text-xl font-bold text-gold-600">${order.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                          <Link href={`/products/${item.product.id}`}>
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                          </Link>
                          <p className="text-sm font-medium text-gray-900 mt-2 max-w-[160px] truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
                      <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping and place your first order</p>
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;

export const getServerSideProps = () => ({ props: {} });
