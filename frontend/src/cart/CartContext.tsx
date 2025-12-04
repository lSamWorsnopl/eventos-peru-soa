import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AxiosError } from 'axios';
import { addCartItem, clearCart, fetchCart, removeCartItem, type CartItemInput, type CartResponse } from '../api/cart';
import { useAuth } from '../auth/AuthContext';

type CartContextValue = {
  cart: CartResponse | null;
  isLoading: boolean;
  isMutating: boolean;
  itemsCount: number;
  refreshCart: () => Promise<void>;
  addItem: (payload: CartItemInput) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== 'CLIENTE') {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      const ax = err as AxiosError;
      if (ax.response?.status === 401) {
        setCart(null);
      } else {
        console.error('[cart] refresh error', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (payload: CartItemInput) => {
      if (!user) throw new Error('UNAUTHENTICATED');
      if (user.role !== 'CLIENTE') throw new Error('ROLE_NOT_ALLOWED');
      setIsMutating(true);
      try {
        const data = await addCartItem(payload);
        setCart(data);
      } finally {
        setIsMutating(false);
      }
    },
    [user],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!user) throw new Error('UNAUTHENTICATED');
      if (user.role !== 'CLIENTE') throw new Error('ROLE_NOT_ALLOWED');
      setIsMutating(true);
      try {
        await removeCartItem(itemId);
        await refreshCart();
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCart, user],
  );

  const clear = useCallback(async () => {
    if (!user) throw new Error('UNAUTHENTICATED');
    if (user.role !== 'CLIENTE') throw new Error('ROLE_NOT_ALLOWED');
    setIsMutating(true);
    try {
      await clearCart();
      setCart({ id: cart?.id ?? '', userId: user.id, items: [] });
    } finally {
      setIsMutating(false);
    }
  }, [cart?.id, user]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isMutating,
      itemsCount: cart?.items?.length ?? 0,
      refreshCart,
      addItem,
      removeItem,
      clear,
    }),
    [cart, isLoading, isMutating, refreshCart, addItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
