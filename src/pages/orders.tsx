import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setOrders([]);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-ink-600 mb-4">Please sign in to access this page.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600">
              Sign In
            </Link>
          </div>
        </div>
      </Layout>
    );
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
      <Head>
        <title>My Orders | eTrue Mark</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
          <h1 className="text-3xl font-bold text-navy-900">My Orders</h1>
          <p className="text-ink-500 mt-1">Track and manage your orders</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusIcon(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-xl border border-ink-200 overflow-hidden">
                  <div className="p-6 border-b bg-ink-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-navy-900">Order #{order.id.slice(-8)}</span>
                          <span className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-ink-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-ink-500">{order.items.length} items</p>
                        <p className="text-xl font-bold text-accent-600">${order.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                          <Link href={`/products/${item.product.id}`}>
                            <div className="relative w-20 h-20 overflow-hidden rounded-xl">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          </Link>
                          <p className="text-sm font-medium text-navy-900 mt-2 max-w-[160px] truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-ink-500">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-ink-500 mb-2">Shipping Address</p>
                      <p className="text-sm text-ink-700">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <FileText className="w-20 h-20 text-ink-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">No orders yet</h2>
            <p className="text-ink-500 mb-6">Start shopping and place your first order</p>
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
