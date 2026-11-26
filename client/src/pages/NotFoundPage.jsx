/**
 * NotFoundPage Component
 * ----------------------
 * 404 Error page for unknown client-side routes.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center max-w-md shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Error 404
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The page you requested does not exist or has been relocated within the BuyNest platform.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
