/**
 * SearchBar Component
 * -------------------
 * E-commerce search bar with category selector dropdown and live autocomplete suggestions.
 * 
 * Viva Concepts:
 * - Debouncing: Delays API search queries until the user pauses typing (300ms),
 *   preventing excessive network requests.
 * - Outside Click Listener: Closes suggestions popup when clicking outside the component.
 * - Controlled Input & URL Synchronization.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { productAPI } from '../services/api';

const CATEGORIES = [
  { value: 'All', label: 'All Categories' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Accessories', label: 'Purses & Bags' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Home & Lifestyle', label: 'Home Decor' },
];

const SearchBar = ({ isMobile = false, onCloseMobile }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for live suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { search: trimmed };
        if (category !== 'All') {
          params.category = category;
        }
        const res = await productAPI.getProducts(params);
        setSuggestions((res.data.products || []).slice(0, 5));
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, category]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsOpen(false);

    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('search', trimmed);
    if (category && category !== 'All') params.set('category', category);

    const targetUrl = params.toString() ? `/?${params.toString()}` : '/';
    navigate(targetUrl);

    if (onCloseMobile) onCloseMobile();

    // Smooth scroll to products section
    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleSelectProduct = (productId) => {
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
    navigate(`/products/${productId}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-full max-w-lg lg:max-w-xl'}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex-1 flex items-center bg-slate-100 hover:bg-slate-50 focus-within:bg-white border border-slate-300 focus-within:border-emerald-500 rounded-xl overflow-hidden transition shadow-sm">
          
          {/* Category Dropdown (Desktop Only) */}
          {!isMobile && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-200/70 hover:bg-slate-200 text-[11px] font-bold text-slate-700 py-2.5 px-3 border-r border-slate-300 focus:outline-none cursor-pointer max-w-[120px] truncate"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          )}

          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              placeholder="Search tops, hoodies, purses, audio..."
              className="w-full bg-transparent px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 mr-1 text-slate-400 hover:text-slate-600 transition rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Loading Spinner Indicator */}
            {loading && (
              <div className="pr-2">
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Submit Button */}
          <button
            type="submit"
            className="bg-slate-900 hover:bg-emerald-600 text-white px-3.5 py-2.5 transition flex items-center justify-center flex-shrink-0"
            aria-label="Submit Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Live Suggestions Dropdown Popup */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Matching Products</span>
            <span className="text-emerald-600 font-bold">Live Results</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => handleSelectProduct(item._id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition text-left group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>

          {/* View All Search Results Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center justify-center gap-1.5"
            >
              <span>See all results for "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
