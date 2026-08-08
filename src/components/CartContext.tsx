import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface CartLineItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: { id: string; name: string; price: number; image: string };
  variant?: { color: string; size: string; price: number } | null;
}

interface CartContextValue {
  items: CartLineItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[CartContext] silent catch:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      refresh();
    } else if (status === 'unauthenticated') {
      setItems([]);
    }
    const onCartUpdated = () => refresh();
    window.addEventListener('cart:updated', onCartUpdated);
    return () => window.removeEventListener('cart:updated', onCartUpdated);
  }, [status, refresh]);

  const addToCart = useCallback(async (productId: string, quantity = 1, variantId?: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity, variantId }),
      });
      if (res.ok) {
        await refresh();
        return true;
      }
      return false;
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[CartContext] silent catch:', e);
      return false;
    }
  }, [refresh]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
        if (res.ok) {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          return true;
        }
        return false;
      }
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
        return true;
      }
      return false;
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[CartContext] silent catch:', e);
      return false;
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return true;
      }
      return false;
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[CartContext] silent catch:', e);
      return false;
    }
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const price = i.variant ? Number(i.variant.price) : Number(i.product.price);
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, loading, refresh, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
