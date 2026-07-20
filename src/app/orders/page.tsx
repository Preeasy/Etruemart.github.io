'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; mainImage: string };
  variation: { color: string; size: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-5 h-5 text-yellow-500" />,
  PAID: <CheckCircle className="w-5 h-5 text-blue-500" />,
  SHIPPED: <Truck className="w-5 h-5 text-purple-500" />,
  DELIVERED: <Package className="w-5 h-5 text-green-500" />,
  COMPLETED: <CheckCircle className="w-5 h-5 text-green-600" />,
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending Payment',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const response = await fetch('/api/orders');
    const data = await response.json();
    if (data.success) {
      setOrders(data.data.orders);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to place your first order.</p>
          <Button onClick={() => router.push('/products')}>Shop Now</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcons[order.status] || <Clock className="w-5 h-5" />}
                  <span className="text-sm font-medium">{statusLabels[order.status] || order.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={item.product.mainImage} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">{item.variation.color} / {item.variation.size} x {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <p className="text-gray-600">Total</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(Number(order.total))}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
