/**
 * CartContext — Global Shopping Cart State (MongoDB-backed)
 * ---------------------------------------------------------
 * Manages cart items, quantities, subtotal calculation, and server-side MongoDB persistence.
 * Each authenticated user has their cart stored and updated directly in MongoDB.
 * 
 * Key Features:
 * - Direct MongoDB persistence via REST API (/api/cart).
 * - Automatic fetch on login or app reload.
 * - Clear state on logout to ensure strict user isolation.
 * - Dynamic subtotal and total count calculations.
 * - Duplicate item prevention with stock-capped quantity updates.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Fetch cart from MongoDB whenever authenticated user changes or logs in
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setCartError(null);
    try {
      const response = await cartAPI.getCart();
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
      }
    } catch (err) {
      console.warn('[Cart Fetch Notice]:', err.message);
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, fetchCart]);

  /**
   * Add a product to the cart or increment quantity in MongoDB
   * @param {Object} product - Product document from database
   * @param {number} quantity - Quantity to add (default 1)
   */
  const addToCart = async (product, quantity = 1) => {
    if (!product || !product._id) return { success: false, message: 'Invalid product' };

    // If user is not authenticated, prompt login
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please sign in to add items to your shopping cart.',
        },
      });
      return { success: false, requireLogin: true };
    }

    const validQty = Math.max(1, Number(quantity) || 1);
    setLoading(true);
    setCartError(null);

    // Optimistic UI update
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => String(item._id) === String(product._id)
      );

      if (existingIndex > -1) {
        return prevItems.map((item, index) => {
          if (index === existingIndex) {
            const newQty = item.quantity + validQty;
            const cappedQty = product.stock ? Math.min(newQty, product.stock) : newQty;
            return { ...item, quantity: cappedQty };
          }
          return item;
        });
      }

      return [
        ...prevItems,
        {
          _id: product._id,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          quantity: validQty,
        },
      ];
    });

    try {
      const response = await cartAPI.addToCart({
        productId: product._id,
        quantity: validQty,
      });

      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
      }
      return { success: true, message: response.data?.message };
    } catch (err) {
      console.error('[Add to Cart Failed]:', err);
      setCartError(err.message);
      // Revert/refresh on error
      fetchCart();
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update quantity of an item directly in MongoDB (+ / - buttons)
   */
  const updateQuantity = async (productId, newQuantity) => {
    if (!productId) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const qty = Number(newQuantity);

    // Optimistic update
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => String(item._id) !== String(productId)));
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          if (String(item._id) === String(productId)) {
            const maxStock = item.stock || 99;
            return { ...item, quantity: Math.min(qty, maxStock) };
          }
          return item;
        })
      );
    }

    try {
      const response = await cartAPI.updateQuantity({
        productId,
        quantity: qty,
      });

      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
      }
    } catch (err) {
      console.error('[Update Quantity Failed]:', err);
      setCartError(err.message);
      fetchCart();
    }
  };

  /**
   * Remove a specific product from cart in MongoDB
   */
  const removeFromCart = async (productId) => {
    if (!productId) return;

    if (!isAuthenticated) {
      setCartItems((prev) => prev.filter((item) => String(item._id) !== String(productId)));
      return;
    }

    // Optimistic update
    setCartItems((prev) => prev.filter((item) => String(item._id) !== String(productId)));

    try {
      const response = await cartAPI.removeFromCart(productId);
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
      }
    } catch (err) {
      console.error('[Remove From Cart Failed]:', err);
      setCartError(err.message);
      fetchCart();
    }
  };

  /**
   * Clear all items from cart in MongoDB (e.g. after successful checkout)
   */
  const clearCart = async () => {
    setCartItems([]);

    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
      } catch (err) {
        console.warn('[Clear Cart Notice]:', err.message);
      }
    }
  };

  // Compute dynamic subtotal from cart items
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 1;
    return acc + itemPrice * itemQty;
  }, 0);

  // Compute total item unit count
  const cartTotalCount = cartItems.reduce((acc, item) => {
    return acc + (Number(item.quantity) || 1);
  }, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalCount,
    loading,
    cartError,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
