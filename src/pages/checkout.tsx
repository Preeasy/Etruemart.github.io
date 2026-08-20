import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { TAX_RATE } from '@/lib/site';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import {
  CreditCard,
  Truck,
  MapPin,
  Plus,
  Check,
  ChevronRight,
  ShieldCheck,
  Package,
  Loader2,
  Info,
  Banknote,
  ArrowLeft,
  X,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/components/CartContext';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  state: string | null;
  city: string;
  zipCode: string | null;
  address: string;
  isDefault: boolean;
}

interface ShippingCalc {
  cost: number;
  isFree: boolean;
  minDays: number;
  maxDays: number;
  templateName: string;
  region: string;
  weightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  orderSubtotal: number;
}

const COMMON_COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore',
  'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'India',
  'United Arab Emirates', 'Saudi Arabia', 'Brazil', 'Mexico', 'Other',
];

const Checkout = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, count, subtotal, loading: cartLoading } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [shipping, setShipping] = useState<ShippingCalc | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', country: 'United States', state: '', city: '', zipCode: '', address: '', isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/checkout');
    }
  }, [status, router]);

  // Load addresses
  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/addresses', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: Address[] = Array.isArray(data) ? data : [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Checkout/session] silent error caught:', e); } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadAddresses();
  }, [session]);

  // Calculate shipping when address changes
  useEffect(() => {
    if (!selectedAddressId || items.length === 0) {
      setShipping(null);
      return;
    }
    const addr = addresses.find((a) => a.id === selectedAddressId);
    if (!addr) return;

    let cancelled = false;
    setShippingLoading(true);
    const calcItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: addr.country, items: calcItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && !data.error) setShipping(data);
      })
      .catch((e: any) => { if (typeof console !== 'undefined') console.warn('[Checkout] shipping calculate failed:', e?.message || e); })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedAddressId, items, addresses]);

  if (status === 'loading' || cartLoading || addressesLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
    }

  if (!session) return null;

  if (items.length === 0 && !success) {
    return (
      <Layout>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-20 text-center">
          <Package className="w-20 h-20 text-ink-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Your cart is empty</h2>
          <p className="text-ink-500 mb-6">Add some products before checking out</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors">
            Browse Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  // Success state
  if (success) {
    return (
      <Layout>
        <Head>
          <title>Order Placed | eTrue Mart</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-success-600" />
          </div>
          <h2 className="text-3xl font-bold text-navy-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-ink-500 mb-2 max-w-md mx-auto">
            Your order has been created. Since the payment collection account is being set up,
            our team will contact you shortly with payment instructions.
          </p>
          <p className="text-sm text-ink-400 mb-8">Order status: <span className="font-semibold text-warning-600">Awaiting Payment</span></p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors">
              View My Orders <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 border border-ink-200 text-ink-700 rounded-lg font-semibold hover:bg-ink-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.country || !newAddress.city || !newAddress.address) {
      setError('Please fill in all required address fields');
      return;
    }
    setSavingAddress(true);
    setError('');
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        const created = await res.json();
        setShowAddressForm(false);
        setNewAddress({ fullName: '', phone: '', country: 'United States', state: '', city: '', zipCode: '', address: '', isDefault: false });
        await loadAddresses();
        setSelectedAddressId(created.id);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save address');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Checkout] silent error caught:', e);
      setError('Network error. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }
    if (placingOrder) return;
    setPlacingOrder(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          paymentMethod,
          notes: '',
        }),
      });
      if (res.ok) {
        setSuccess(true);
        window.scrollTo(0, 0);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Checkout] silent error caught:', e);
      setError('Network error. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingCost = shipping?.cost ?? 0;
  const total = Math.round((subtotal + shippingCost + taxAmount) * 100) / 100;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <Layout>
      <Head>
        <title>Checkout | eTrue Mart</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="bg-white border-b border-ink-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/cart" className="p-2 hover:bg-ink-50 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-ink-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">Checkout</h1>
                <p className="text-sm text-ink-500">{count} {count === 1 ? 'item' : 'items'} · Complete your order</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-ink-500">
              <ShieldCheck className="w-4 h-4 text-success-500" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: address + payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <section className="bg-white rounded-xl border border-ink-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="font-bold text-navy-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-accent-500" />Shipping Address</h2>
              </div>
              <div className="p-5">
                {addresses.length > 0 && !showAddressForm ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-accent-500 bg-accent-50/50' : 'border-ink-200 hover:border-ink-300'}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 w-4 h-4 text-accent-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-navy-900">{addr.fullName}</span>
                            <span className="text-sm text-ink-500">{addr.phone}</span>
                            {addr.isDefault && <span className="text-[10px] bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded font-semibold">DEFAULT</span>}
                          </div>
                          <p className="text-sm text-ink-600 mt-1">
                            {addr.address}, {addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.zipCode ? ` ${addr.zipCode}` : ''}
                          </p>
                          <p className="text-sm text-ink-500">{addr.country}</p>
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-ink-200 rounded-lg text-ink-600 hover:border-accent-400 hover:text-accent-600 transition-colors font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add New Address
                    </button>
                  </div>
                ) : showAddressForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-navy-900">Add New Address</h3>
                      <button onClick={() => setShowAddressForm(false)} className="p-1.5 hover:bg-ink-50 rounded-lg">
                        <X className="w-4 h-4 text-ink-500" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink-600 mb-1">Full Name *</label>
                        <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-600 mb-1">Phone *</label>
                        <input type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm" required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink-600 mb-1">Country *</label>
                        <select value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm bg-white">
                          {COMMON_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-600 mb-1">State / Province</label>
                        <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink-600 mb-1">City *</label>
                        <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-600 mb-1">ZIP / Postal Code</label>
                        <input type="text" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-600 mb-1">Street Address *</label>
                      <textarea value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm" required />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-ink-600">
                      <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="w-4 h-4 text-accent-500 rounded" />
                      Set as default address
                    </label>
                    <button onClick={handleSaveAddress} disabled={savingAddress} className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
                      {savingAddress ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Check className="w-4 h-4" />Save Address</>}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-10 h-10 text-ink-300 mx-auto mb-2" />
                    <p className="text-ink-500 text-sm mb-4">No saved addresses yet</p>
                    <button onClick={() => setShowAddressForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white rounded-lg font-semibold text-sm hover:bg-accent-600 transition-colors">
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Step 2: Shipping Method */}
            <section className="bg-white rounded-xl border border-ink-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${selectedAddressId ? 'bg-accent-500 text-white' : 'bg-ink-100 text-ink-400'}`}>2</div>
                <h2 className="font-bold text-navy-900 flex items-center gap-2"><Truck className="w-4 h-4 text-accent-500" />Shipping Method</h2>
              </div>
              <div className="p-5">
                {!selectedAddressId ? (
                  <p className="text-sm text-ink-400 text-center py-4">Please select a shipping address first</p>
                ) : shippingLoading ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-sm text-ink-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Calculating shipping cost...
                  </div>
                ) : shipping ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-accent-500 bg-accent-50/30">
                      <Truck className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-semibold text-navy-900">{shipping.templateName}</span>
                          <span className="font-bold text-accent-600">{shipping.isFree ? 'FREE' : `$${shipping.cost.toFixed(2)}`}</span>
                        </div>
                        <p className="text-xs text-ink-500 mt-1">
                          Estimated delivery: {shipping.minDays}-{shipping.maxDays} business days · Region: {shipping.region}
                        </p>
                        {shipping.chargeableWeightKg > 0 && (
                          <p className="text-xs text-ink-400 mt-1">
                            Chargeable weight: {shipping.chargeableWeightKg} kg
                            {shipping.volumetricWeightKg > shipping.weightKg && ' (volumetric)'}
                          </p>
                        )}
                        {shipping.isFree && (
                          <p className="text-xs text-success-600 mt-1 font-medium">
                            Shipping fee waived for this order
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-ink-400 text-center py-4">Unable to calculate shipping. Please try again.</p>
                )}
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="bg-white rounded-xl border border-ink-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${selectedAddressId ? 'bg-accent-500 text-white' : 'bg-ink-100 text-ink-400'}`}>3</div>
                <h2 className="font-bold text-navy-900 flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent-500" />Payment Method</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-accent-500 bg-accent-50/30' : 'border-ink-200 hover:border-ink-300'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="mt-1 w-4 h-4 text-accent-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-navy-600" />
                        <span className="font-semibold text-navy-900">Bank Transfer</span>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">Pay via bank transfer. Our team will send you the payment details after order confirmation.</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'PAYPAL' ? 'border-accent-500 bg-accent-50/30' : 'border-ink-200 hover:border-ink-300'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'PAYPAL'} onChange={() => setPaymentMethod('PAYPAL')} className="mt-1 w-4 h-4 text-accent-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-navy-600" />
                        <span className="font-semibold text-navy-900">PayPal / Credit Card</span>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">Online payment via PayPal (account or credit card). Coming soon — contact us to arrange.</p>
                    </div>
                  </label>
                </div>
                <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-700 leading-relaxed">
                    The online payment account is being set up. Your order will be created with status
                    <span className="font-semibold"> "Awaiting Payment"</span>, and our team will contact you with payment instructions.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-ink-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-navy-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-ink-100">
                        <Image
                          src={item.product.image || ""}
                          alt={item.product.name}
                          fill
                          sizes="56px"
                          className="object-cover rounded-lg"
                          onError={(e) => { (e.currentTarget as unknown as HTMLImageElement).style.visibility = 'hidden'; }}
                        />
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-navy-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-navy-800 line-clamp-2 leading-tight">{item.product.name}</p>
                        {item.variant && <p className="text-[10px] text-ink-400 mt-0.5">{item.variant.color} / {item.variant.size}</p>}
                      </div>
                      <span className="text-xs font-semibold text-navy-900 flex-shrink-0">${(price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 py-4 border-t border-ink-100">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Subtotal ({count} items)</span>
                  <span className="font-semibold text-navy-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Shipping</span>
                  {shippingLoading ? (
                    <span className="text-ink-400 text-xs flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Calculating</span>
                  ) : shipping ? (
                    <span className={`font-semibold ${shipping.isFree ? 'text-success-600' : 'text-navy-900'}`}>{shipping.isFree ? 'FREE' : `$${shipping.cost.toFixed(2)}`}</span>
                  ) : (
                    <span className="text-ink-400 text-xs">—</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Tax (8%)</span>
                  <span className="font-semibold text-navy-900">${taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline py-3 border-t border-ink-100">
                <span className="font-bold text-navy-900">Total</span>
                <span className="text-2xl font-bold text-accent-600">${total.toFixed(2)}</span>
              </div>

              {selectedAddress && (
                <div className="mt-4 p-3 bg-ink-50 rounded-lg">
                  <p className="text-[10px] uppercase tracking-wide text-ink-400 font-semibold mb-1">Delivering to</p>
                  <p className="text-xs text-navy-800 font-medium">{selectedAddress.fullName}</p>
                  <p className="text-xs text-ink-500">{selectedAddress.country}</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId || shippingLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                {placingOrder ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Placing Order...</>
                ) : (
                  <><CreditCard className="w-5 h-5" />Place Order · ${total.toFixed(2)}</>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-ink-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Your information is secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
