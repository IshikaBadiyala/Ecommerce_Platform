/**
 * CategoryBar Component
 * ---------------------
 * Modern visual category strip with circular thumbnails, category titles,
 * and active state indicators (similar to Flipkart / Myntra / Amazon category bubbles).
 */

import { Sparkles, Shirt, ShoppingBag, Headphones, Home } from 'lucide-react';

const CATEGORY_ITEMS = [
  {
    name: 'All',
    label: 'All Items',
    sublabel: 'Full Catalogue',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80',
    color: 'from-emerald-600 to-teal-700',
  },
  {
    name: 'Clothing',
    label: "Clothing",
    sublabel: 'Tops & Hoodies',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80',
    color: 'from-pink-600 to-rose-700',
  },
  {
    name: 'Accessories',
    label: 'Purses & Bags',
    sublabel: 'Luxury Slings',
    icon: ShoppingBag,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
    color: 'from-amber-600 to-orange-700',
  },
  {
    name: 'Electronics',
    label: 'Electronics',
    sublabel: 'Audio & Gadgets',
    icon: Headphones,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    name: 'Home & Lifestyle',
    label: 'Home Decor',
    sublabel: 'Living & Decor',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
    color: 'from-teal-600 to-emerald-700',
  },
];

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Shop by Department
          </span>
          <span className="text-[11px] text-emerald-600 font-bold hidden sm:inline">
            Free Express Shipping on all categories
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_ITEMS.map((cat) => {
            const isActive = selectedCategory === cat.name;
            const Icon = cat.icon;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none transition-transform"
              >
                {/* Circle with image / icon overlay */}
                <div
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden p-0.5 transition-all duration-200 ${
                    isActive
                      ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105 shadow-md shadow-emerald-500/20'
                      : 'border border-slate-200 hover:border-slate-400 hover:scale-105'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent rounded-xl" />
                  
                  {/* Floating Mini Icon */}
                  <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-md bg-white/90 backdrop-blur-sm text-slate-800 flex items-center justify-center shadow-sm">
                    <Icon className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>

                {/* Labels */}
                <span
                  className={`text-xs font-bold mt-2 tracking-tight transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-800 group-hover:text-slate-950'
                  }`}
                >
                  {cat.label}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {cat.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
