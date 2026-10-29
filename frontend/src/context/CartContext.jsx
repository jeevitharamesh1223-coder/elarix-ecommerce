import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

const safeGetStorageArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) 
      ? parsed.filter(item => item && typeof item === 'object' && item.id !== undefined) 
      : [];
  } catch (error) {
    console.warn(`[CartContext] Malformed localStorage data for key "${key}". Resetting to empty array.`);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => safeGetStorageArray('cartItems'));
  const [wishlistItems, setWishlistItems] = useState(() => safeGetStorageArray('wishlistItems'));

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (err) {
      console.error('[CartContext] Failed to persist cartItems:', err);
    }
  }, [cartItems]);

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    } catch (err) {
      console.error('[CartContext] Failed to persist wishlistItems:', err);
    }
  }, [wishlistItems]);

  // Add single product to cart
  const addToCart = useCallback((product, qty = 1) => {
    if (!product || product.id === undefined) return;
    const maxStock = product.countInStock !== undefined ? product.countInStock : 50;
    if (maxStock <= 0) return; // Cannot add out of stock items
    const quantity = Math.max(1, Number(qty) || 1);

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const targetQty = Math.min(maxStock, existing.qty + quantity);
        return prev.map(item =>
          item.id === product.id
            ? { ...item, ...product, qty: targetQty }
            : item
        );
      }
      return [...prev, { ...product, qty: Math.min(maxStock, quantity) }];
    });
  }, []);

  // Atomic batch addition to cart (prevents race conditions when moving multiple wishlist items)
  const addMultipleToCart = useCallback((products) => {
    if (!Array.isArray(products) || products.length === 0) return;

    setCartItems(prev => {
      const map = new Map(prev.map(item => [item.id, { ...item }]));
      for (const prod of products) {
        if (!prod || prod.id === undefined) continue;
        const maxStock = prod.countInStock !== undefined ? prod.countInStock : 50;
        if (maxStock <= 0) continue;

        if (map.has(prod.id)) {
          const current = map.get(prod.id);
          current.qty = Math.min(maxStock, current.qty + 1);
        } else {
          map.set(prod.id, { ...prod, qty: 1 });
        }
      }
      return Array.from(map.values());
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Update item quantity
  const updateCartQty = useCallback((id, qty) => {
    const rawQty = Math.max(1, Number(qty) || 1);
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const maxStock = item.countInStock !== undefined ? item.countInStock : 50;
          return { ...item, qty: Math.min(maxStock, rawQty) };
        }
        return item;
      })
    );
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Toggle item in wishlist (no duplicates)
  const toggleWishlist = useCallback((product) => {
    if (!product || product.id === undefined) return;
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  // Remove explicit item from wishlist
  const removeFromWishlist = useCallback((id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
