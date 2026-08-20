import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Truck, ChevronRight, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/components/CartContext';
import { TAX_RATE, MINIMUM_ORDER_AMOUNT, SHIPPING_ESTIMATE } from '@/lib/site';

const Cart = () => {
  const { data: session, status } = useSession();
  const { items, count, subtotal, loading, updateQuantity, removeItem } = useCart();

  if (status === 'loading' || loading) {
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-20 text-center">
          <ShoppingCart className="w-20 h-20 text-ink-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Sign in to view your cart</h2>
          <p className="text-ink-500 mb-6">Please sign in to start shopping</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors">
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  // Estimated shipping — real calculation happens at checkout based on address.
  // 全站不免运费：运费始终产生，结账时按地址精确计算
  const estimatedShipping = SHIPPING_ESTIMATE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const estimatedTotal = subtotal + estimatedShipping + tax;
  const belowMinimum = subtotal < MINIMUM_ORDER_AMOUNT;

  return (
    <Layout>
      <Head>
        <title>Shopping Cart | eTrue Mart</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">Shopping Cart</h1>
              <p className="text-ink-500 mt-1">{count} {count === 1 ? 'item' : 'items'} in your cart</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-accent-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => {
                  const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-ink-200 p-4 sm:p-6 flex gap-4">
                      <Link href={`/products/${item.product.id}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-ink-100">
                        <Image
                          src={item.product.image || ""}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="!object-cover !w-auto !h-auto rounded-xl"
                          onError={(e) => { (e.currentTarget as unknown as HTMLImageElement).style.visibility = 'hidden'; }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-semibold text-navy-900 hover:text-accent-600 line-clamp-2">{item.product.name}</h3>
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-ink-500 mt-1">
                            {item.variant.color} / {item.variant.size}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                          <span className="text-xl font-bold text-accent-600">
                            ${price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-ink-200 rounded-lg bg-white">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity" className="p-2 hover:bg-ink-50 transition-colors">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 font-semibold text-navy-900 min-w-[40px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" className="p-2 hover:bg-ink-50 transition-colors">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="p-2 hover:bg-red-50 hover:text-red-600 transition-colors text-ink-500">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-ink-400">Subtotal</p>
                        <p className="text-lg font-bold text-navy-900">${(price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
                <ShoppingCart className="w-20 h-20 text-ink-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-navy-900 mb-2">Your cart is empty</h2>
                <p className="text-ink-500 mb-6">Start shopping and add items to your cart</p>
                <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors">
                  Browse Products <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-ink-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-navy-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-ink-500">Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold text-navy-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Estimated Shipping</span>
                    <span className="font-semibold text-navy-900">{estimatedShipping === 0 ? 'Free' : `$${estimatedShipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Estimated Tax</span>
                    <span className="font-semibold text-navy-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-ink-100 pt-3 flex justify-between">
                    <span className="font-semibold text-navy-900">Estimated Total</span>
                    <span className="text-2xl font-bold text-accent-600">${estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-ink-400 mb-4 leading-relaxed">
                  Final shipping cost is calculated at checkout based on your delivery address, order weight and volumetric weight.
                </p>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </Link>

                <div className="mt-6 p-4 bg-ink-50 rounded-lg">
                  <div className="flex items-center gap-3 text-sm text-ink-700">
                    <Truck className="w-5 h-5 text-accent-600 flex-shrink-0" />
                    <span>Free shipping on orders over $50</span>
                  </div>
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
