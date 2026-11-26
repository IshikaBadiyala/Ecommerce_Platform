/**
 * Navbar Component
 * ----------------
 * Responsive top navigation bar featuring top announcement utility bar,
 * permanent visible Sign In & Create Account buttons, category navigation with
 * auto-scroll to products, dynamic cart count badge, and user dropdown.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Menu, X, Shield, Package, LogOut, LogIn, UserPlus, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartTotalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_DEPARTMENTS = [
    { id: 'All', label: 'All Products' },
    { id: 'Clothing', label: 'Clothing (Tops & Hoodies)' },
    { id: 'Accessories', label: 'Purses & Handbags' },
    { id: 'Electronics', label: 'Electronics & Audio' },
    { id: 'Home & Lifestyle', label: 'Home Decor' },
  ];

  const isDepartmentActive = (catId) => {
    if (catId === 'All') {
      return location.pathname === '/' && !location.search;
    }
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category') === catId || location.search.includes(encodeURIComponent(catId)) || location.search.includes(catId);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const handleCategoryNav = (categoryName) => {
    setMobileMenuOpen(false);
    if (categoryName === 'All') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(categoryName)}`);
    }

    // Smooth scroll down to products section so the customer immediately sees filtered items
    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      
      {/* 1. Top Announcement & Quick Auth Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs text-slate-300">
            <span>🇮🇳</span> Free Express Delivery on orders above ₹999 across India
          </span>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <Link to="/wishlist" className="text-slate-300 hover:text-white transition flex items-center gap-1 font-medium">
              <Heart className={`w-3 h-3 ${wishlistCount > 0 ? 'text-red-400 fill-red-400' : 'text-slate-400'}`} />
              <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
            </Link>
            <span className="text-slate-600">•</span>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span>Welcome, <strong className="text-white">{user?.name}</strong></span>
                <span className="text-slate-600">•</span>
                <Link to="/my-orders" className="text-emerald-400 hover:underline">My Orders</Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 font-semibold">
                <Link to="/login" className="text-slate-300 hover:text-white transition flex items-center gap-1">
                  <LogIn className="w-3 h-3 text-emerald-400" /> Sign In
                </Link>
                <span className="text-slate-600">•</span>
                <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-emerald-400 text-lg tracking-wider">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                BUYNEST
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider -mt-1">
                Online Store
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-2">
            <SearchBar />
          </div>

          {/* Right Action Icons (Wishlist, Cart & User / Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-slate-700 hover:text-red-500 hover:bg-slate-100 transition"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'text-red-500 fill-red-50' : 'text-slate-700'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[11px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-[11px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow">
                  {cartTotalCount}
                </span>
              )}
            </Link>

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 transition shadow-sm"
                >
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Account</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {user?.role === 'admin' ? 'Store Administrator' : 'Shopper'}
                      </span>
                    </div>

                    <Link
                      to="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      Saved Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        Admin Products
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated: Permanently Visible Sign In & Create Account Buttons */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition whitespace-nowrap"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 3. Desktop Department / Category Sub-Navbar */}
        <div className="hidden lg:block border-t border-slate-100 bg-slate-50/70 py-2">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 sm:gap-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              {NAV_DEPARTMENTS.map((dept) => {
                const active = isDepartmentActive(dept.id);
                return (
                  <button
                    key={dept.id}
                    onClick={() => handleCategoryNav(dept.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {dept.label}
                  </button>
                );
              })}
            </nav>

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 transition-colors ${
                  location.pathname === '/admin' ? 'ring-1 ring-emerald-500' : ''
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                Admin Products
              </Link>
            )}
          </div>
        </div>

        {/* 4. Mobile Quick Search Bar */}
        <div className="md:hidden pb-3 pt-1 border-t border-slate-100">
          <SearchBar isMobile={true} />
        </div>

        {/* 3. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 flex flex-col gap-2">
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-slate-700 border border-slate-300 rounded-xl bg-white shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white bg-slate-900 rounded-xl shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Wishlist Link */}
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-xs font-bold text-red-600 hover:text-red-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => handleCategoryNav('All')}
              className="text-left py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 uppercase"
            >
              All Products
            </button>
            <button
              onClick={() => handleCategoryNav('Clothing')}
              className="text-left py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 uppercase"
            >
              Clothing (Tops & Hoodies)
            </button>
            <button
              onClick={() => handleCategoryNav('Accessories')}
              className="text-left py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 uppercase"
            >
              Purses & Handbags
            </button>
            <button
              onClick={() => handleCategoryNav('Electronics')}
              className="text-left py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 uppercase"
            >
              Electronics & Audio
            </button>
            <button
              onClick={() => handleCategoryNav('Home & Lifestyle')}
              className="text-left py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 uppercase"
            >
              Home Decor
            </button>

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 py-1 flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-600 hover:text-red-700 py-1 text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
