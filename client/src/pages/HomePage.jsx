/**
 * HomePage Component
 * ------------------
 * Flagship e-commerce landing page featuring:
 * - Dynamic HeroCarousel with auto-play & pause on hover
 * - Department / Category visual bubbles (CategoryBar)
 * - Pan-India delivery & trust highlight strip
 * - Dedicated Category Spotlight sections (Fashion, Purses, Tech, Home)
 * - Synchronized search bar & category filters
 * - Sort options & responsive product grid
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
  RefreshCcw,
  Truck,
  ShieldCheck,
  RotateCcw,
  Banknote,
  ArrowRight,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import HeroCarousel from '../components/HeroCarousel';
import CategoryBar from '../components/CategoryBar';

const CATEGORIES = [
  { name: 'All', label: 'All Products' },
  { name: 'Clothing', label: 'Clothing (Tops & Hoodies)' },
  { name: 'Accessories', label: 'Purses & Handbags' },
  { name: 'Electronics', label: 'Electronics & Audio' },
  { name: 'Home & Lifestyle', label: 'Home Decor' },
];

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');

  // Synchronize state when URL query params change (e.g. from top Navbar search or category links)
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const query = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(query);

    if (cat !== 'All' || query) {
      setTimeout(() => {
        const el = document.getElementById('products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  // Fetch catalogue from Express REST API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const response = await productAPI.getProducts(params);
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Unable to load products. Please check the backend server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);

    // Scroll to products
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSearchParams({});
  };

  // Curated category subsets for showcase sections when viewing All products without a search query
  const clothingProducts = products.filter((p) => p.category === 'Clothing').slice(0, 4);
  const accessoriesProducts = products.filter((p) => p.category === 'Accessories').slice(0, 4);
  const electronicsProducts = products.filter((p) => p.category === 'Electronics').slice(0, 4);
  const homeProducts = products.filter((p) => p.category === 'Home & Lifestyle').slice(0, 4);

  return (
    <div className="space-y-8 sm:space-y-12 pb-20">
      
      {/* 1. Interactive Hero Banner Carousel */}
      <HeroCarousel onSelectCategory={handleCategoryClick} />

      {/* 2. Shop by Department / Category Thumbnails */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryClick}
      />

      {/* 3. Value & Trust Highlights Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pan-India Express</h4>
              <p className="text-[11px] text-slate-500">Free delivery on orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-500">Pay with Cash or UPI upon delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Hassle-free size exchange & refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Quality</h4>
              <p className="text-[11px] text-slate-500">Verified products & authentic reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Category Showcase Hubs (Rendered when viewing All Products with no active search) */}
      {selectedCategory === 'All' && !searchQuery.trim() && !loading && (
        <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* A. Clothing / Fashion Section */}
          {clothingProducts.length > 0 && (
            <section className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-[11px] font-bold mb-2">
                    <Flame className="w-3.5 h-3.5 text-pink-600" />
                    <span>Trending Fashion</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Women's Tops, Dresses & Streetwear
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Floral peplum tops, ribbed knitwear, and cozy fleece hoodies
                  </p>
                </div>
                <button
                  onClick={() => handleCategoryClick('Clothing')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 hover:text-pink-800 hover:underline flex-shrink-0"
                >
                  Explore All Clothing <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {clothingProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* B. Purses & Handbags Section */}
          {accessoriesProducts.length > 0 && (
            <section className="bg-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-200/60">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Luxury & Everyday Bags</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Designer Handbags & Crossbody Slings
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quilted satchels, structured tote bags, and everyday clutches
                  </p>
                </div>
                <button
                  onClick={() => handleCategoryClick('Accessories')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline flex-shrink-0"
                >
                  Explore All Handbags <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {accessoriesProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* C. Smart Electronics & Audio Section */}
          {electronicsProducts.length > 0 && (
            <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acoustic Audio & Gadgets</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Smart Electronics & ANC Audio
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Active Noise Cancelling headphones, AMOLED smartwatches, and tactile keyboards
                  </p>
                </div>
                <button
                  onClick={() => handleCategoryClick('Electronics')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex-shrink-0"
                >
                  Explore All Tech <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {electronicsProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* D. Home Decor & Living Section */}
          {homeProducts.length > 0 && (
            <section className="bg-teal-50/40 rounded-3xl p-6 sm:p-8 border border-teal-200/60">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-[11px] font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span>Aesthetic Living</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Modern Home Decor & Diffusers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ultrasonic aroma diffusers, handcrafted ceramic planters, and minimalist lamps
                  </p>
                </div>
                <button
                  onClick={() => handleCategoryClick('Home & Lifestyle')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 hover:underline flex-shrink-0"
                >
                  Explore All Home Decor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {homeProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* 5. Main Catalogue / Filtered Browse Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 scroll-mt-28">
        
        {/* Active Filter Banner (When filtered by category or search) */}
        {(selectedCategory !== 'All' || searchQuery.trim()) && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-emerald-950">Active Filters: </span>
                {selectedCategory !== 'All' && (
                  <span className="inline-block bg-white border border-emerald-300 text-emerald-800 font-bold px-2 py-0.5 rounded-md ml-1">
                    Department: {selectedCategory}
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-block bg-white border border-emerald-300 text-emerald-800 font-bold px-2 py-0.5 rounded-md ml-1">
                    Query: "{searchQuery}"
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-emerald-700 hover:text-red-600 flex items-center gap-1 transition"
            >
              <X className="w-3.5 h-3.5" /> Reset to All Products
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                {selectedCategory === 'All' ? 'Catalogue Collection' : `${selectedCategory} Collection`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {selectedCategory === 'All'
                ? 'All Products & Curated Catalogue'
                : `Showing ${selectedCategory}`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {products.length} products with Cash on Delivery across India
            </p>
          </div>

          {/* Search & Sort Controls inside Catalogue */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword..."
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition shadow-sm placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition shadow-sm cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center my-8">
            <p className="font-semibold text-sm mb-2">Unable to Load Products</p>
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <LoadingSpinner text="Loading curated products..." />}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center my-8 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              We couldn't find any products matching your search. Try searching for "top", "hoodie", "purse", or "headphones".
            </p>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View all products
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
};

export default HomePage;
