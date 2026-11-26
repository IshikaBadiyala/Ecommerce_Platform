/**
 * Footer Component
 * ----------------
 * Provides brand story, catalogue links, customer assurance highlights in INR (₹),
 * and academic project attribution.
 */

import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCw, Banknote } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      {/* Value Badges Banner */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Truck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Free Pan-India Delivery</h4>
              <p className="text-xs text-slate-400">On all orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Banknote className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Cash on Delivery</h4>
              <p className="text-xs text-slate-400">Pay cash or UPI at doorstep</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <RefreshCw className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free demo exchanges</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">100% Secure Store</h4>
              <p className="text-xs text-slate-400">Safe shopping & data privacy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="font-extrabold text-emerald-400 text-base">B</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">BUYNEST</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              Modern Indian lifestyle & fashion store featuring women's tops, men's streetwear hoodies,
              handcrafted purses, and everyday essentials.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/?category=Clothing" className="hover:text-white transition-colors">
                  Women's Tops & Men's Hoodies
                </Link>
              </li>
              <li>
                <Link to="/?category=Accessories" className="hover:text-white transition-colors">
                  Leather Purses & Slings
                </Link>
              </li>
              <li>
                <Link to="/?category=Electronics" className="hover:text-white transition-colors">
                  Audio, Smartwatches & Gear
                </Link>
              </li>
              <li>
                <Link to="/?category=Home & Lifestyle" className="hover:text-white transition-colors">
                  Home Decor & Diffusers
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
              <li><Link to="/my-orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Login</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Viva & Tech Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Project Specs</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              <strong className="text-slate-200">Tech Stack:</strong> React 18, Vite, Node.js, Express, MongoDB Atlas, Mongoose, Tailwind CSS.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Currency:</strong> Indian Rupee (₹ INR) • Cash on Delivery (COD).
            </p>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BuyNest E-Commerce. Developed for Academic Viva Voce Examination.</p>
          <p className="mt-2 sm:mt-0">MERN Stack • Indian E-Commerce Architecture</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
