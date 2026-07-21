import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Truck, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';

interface CartItem {
  id: string;
  product: { id: string; name: string; price: number; image: string };
  variant?: { color: string; size: string; price: number };
  quantity: number;
}

const Cart = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => setItems(data));
    }
  }, [session]);

  if (!session) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Please sign in to view your cart</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </Layout>
    );
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
    } else {
      await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      setItems(items.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const removeItem = async (id: string) => {
    await fetch(`/api/cart/${id}`, { method: 'DELETE' });
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingCost = totalAmount > 50 ? 0 : 5;
  const taxAmount = totalAmount * 0.08;
  const grandTotal = totalAmount + shippingCost + taxAmount;

  const handleCheckout = async () => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddress, paymentMethod: 'stripe' }),
    });
    router.push('/orders');
  };

  return (
    <Layout>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{items.length} items in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6 flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-primary-600">{item.product.name}</h3>
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.variant.color} / {item.variant.size}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-bold text-accent-600">
                          ${(item.variant?.price || item.product.price).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 transition-colors">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Start shopping and add items to your cart</p>
                <Link href="/products" className="btn-primary">
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-accent-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your shipping address..."
                  required
                />
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-primary-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cart;

export const getServerSideProps = () => ({ props: {} });
