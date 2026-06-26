// =============================================================
//  storefront/src/contexts/CartContext.jsx
//  Manages shopping cart state.
//
//  Strategy:
//  - Logged-in users: cart is synced with the backend API
//  - Guest users: cart is stored in localStorage
//  - On login: localStorage cart is merged into backend cart
// =============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const GUEST_CART_KEY = "guest_cart";

// ── Guest cart helpers (localStorage) ────────────────────────

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

// ── Provider ──────────────────────────────────────────────────

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cart, setCart]             = useState(null);
  const [guestItems, setGuestItems] = useState(getGuestCart);
  const [loading, setLoading]       = useState(false);

  // ── Fetch backend cart when user logs in ──────────────────

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get("/orders/cart/");
      setCart(res.data);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  // ── Merge guest cart into backend on login ────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    const guest = getGuestCart();
    if (guest.length === 0) return;

    const mergeCart = async () => {
      for (const item of guest) {
        try {
          await api.post("/orders/cart/items/", {
            product_id: item.product.id,
            quantity: item.quantity,
          });
        } catch {
          // Item may be out of stock — skip silently
        }
      }
      clearGuestCart();
      setGuestItems([]);
      fetchCart();
    };

    mergeCart();
  }, [isAuthenticated]);

  // ── Add to cart ───────────────────────────────────────────

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      const res = await api.post("/orders/cart/items/", {
        product_id: product.id,
        quantity,
      });
      setCart(res.data);
    } else {
      const items = getGuestCart();
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({ product, quantity });
      }
      saveGuestCart(items);
      setGuestItems([...items]);
    }
  };

  // ── Update quantity ───────────────────────────────────────

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      const res = await api.patch(`/orders/cart/items/${itemId}/`, {
        quantity,
      });
      setCart(res.data);
    } else {
      const items = getGuestCart().map((i) =>
        i.product.id === itemId ? { ...i, quantity } : i
      );
      saveGuestCart(items);
      setGuestItems([...items]);
    }
  };

  // ── Remove item ───────────────────────────────────────────

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      const res = await api.delete(`/orders/cart/items/${itemId}/`);
      setCart(res.data);
    } else {
      const items = getGuestCart().filter((i) => i.product.id !== itemId);
      saveGuestCart(items);
      setGuestItems([...items]);
    }
  };

  // ── Clear cart ────────────────────────────────────────────

  const clearCart = async () => {
    if (isAuthenticated) {
      const res = await api.delete("/orders/cart/clear/");
      setCart(res.data);
    } else {
      clearGuestCart();
      setGuestItems([]);
    }
  };

  // ── Derived values ────────────────────────────────────────

  const cartItems = isAuthenticated
    ? cart?.items || []
    : guestItems;

  const totalItems = isAuthenticated
    ? cart?.total_items || 0
    : guestItems.reduce((sum, i) => sum + i.quantity, 0);

  const totalPrice = isAuthenticated
    ? cart?.total_price || 0
    : guestItems.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      );

  // ── Expose ────────────────────────────────────────────────

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        totalItems,
        totalPrice,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}