/**
 * WishlistContext — Global Wishlist State Management (MongoDB-backed)
 * -------------------------------------------------------------------
 * Manages saved products across sessions using MongoDB persistence.
 * Each authenticated user has their wishlist stored and updated directly in MongoDB.
 * 
 * Key Features:
 * - Direct MongoDB persistence via REST API (/api/wishlist).
 * - Automatic fetch on user login or app reload.
 * - Clear state on logout to ensure strict user isolation.
 * - Dynamic badge counter for Navbar.
 * - Instant toggle, add, remove, and duplicate prevention.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  // Fetch wishlist from MongoDB whenever authenticated user changes
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setWishlistError(null);
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.data && response.data.wishlist) {
        setWishlistItems(response.data.wishlist.products || []);
      }
    } catch (err) {
      console.warn('[Wishlist Fetch Notice]:', err.message);
      setWishlistError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchWishlist();
    }
  }, [authLoading, fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => String(item._id) === String(productId));
  };

  const addToWishlist = async (product) => {
    if (!product || !product._id) return false;

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please sign in to save products to your wishlist.',
        },
      });
      return false;
    }

    // Optimistic update
    setWishlistItems((prev) => {
      if (prev.some((item) => String(item._id) === String(product._id))) {
        return prev;
      }
      return [product, ...prev];
    });

    try {
      const response = await wishlistAPI.addToWishlist({ productId: product._id });
      if (response.data && response.data.wishlist) {
        setWishlistItems(response.data.wishlist.products || []);
      }
      return true;
    } catch (err) {
      console.error('[Add to Wishlist Failed]:', err);
      fetchWishlist();
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!productId) return false;

    if (!isAuthenticated) {
      setWishlistItems((prev) => prev.filter((item) => String(item._id) !== String(productId)));
      return false;
    }

    // Optimistic update
    setWishlistItems((prev) => prev.filter((item) => String(item._id) !== String(productId)));

    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      if (response.data && response.data.wishlist) {
        setWishlistItems(response.data.wishlist.products || []);
      }
      return true;
    } catch (err) {
      console.error('[Remove From Wishlist Failed]:', err);
      fetchWishlist();
      return false;
    }
  };

  const toggleWishlist = async (product) => {
    if (!product || !product._id) return false;

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please sign in to save products to your wishlist.',
        },
      });
      return false;
    }

    const currentlyInWishlist = isInWishlist(product._id);

    // Optimistic toggle
    if (currentlyInWishlist) {
      setWishlistItems((prev) => prev.filter((item) => String(item._id) !== String(product._id)));
    } else {
      setWishlistItems((prev) => [product, ...prev]);
    }

    try {
      const response = await wishlistAPI.toggleWishlist({ productId: product._id });
      if (response.data && response.data.wishlist) {
        setWishlistItems(response.data.wishlist.products || []);
      }
      return response.data.action === 'added';
    } catch (err) {
      console.error('[Toggle Wishlist Failed]:', err);
      fetchWishlist();
      return currentlyInWishlist;
    }
  };

  const clearWishlist = async () => {
    setWishlistItems([]);

    if (isAuthenticated) {
      try {
        await wishlistAPI.clearWishlist();
      } catch (err) {
        console.warn('[Clear Wishlist Notice]:', err.message);
      }
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        loading,
        wishlistError,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
