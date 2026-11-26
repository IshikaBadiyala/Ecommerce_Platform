/**
 * HeroCarousel Component
 * ----------------------
 * Interactive full-width e-commerce banner slider featuring:
 * - Auto-play with smooth pause-on-hover
 * - Previous / Next navigation buttons with slick hover effects
 * - Dot indicators with active pill animation
 * - Direct category CTAs with smooth scrolling
 * - Pan-India COD and trust assurance badges
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShoppingBag, ShieldCheck, Truck, Banknote, RotateCcw } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: 'Festive Season Mega Sale • Up to 50% OFF',
    title: 'Trendy Tops, Streetwear & Everyday Fashion',
    subtitle: 'Discover chic floral peplum tops, oversized fleece hoodies, and statement dresses crafted for contemporary Indian lifestyle.',
    ctaText: 'Shop Fashion',
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    accentColor: 'from-emerald-500/30 via-slate-900/80 to-slate-950',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
  },
  {
    id: 2,
    badge: 'Luxury Purses & Handbags • New Arrivals',
    title: 'Designer Quilted Handbags & Crossbody Slings',
    subtitle: 'Elegance meets functionality with our premium scratch-resistant vegan leather bags, spacious satchels, and evening clutches.',
    ctaText: 'Explore Purses & Bags',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1600&q=80',
    accentColor: 'from-amber-500/25 via-slate-900/80 to-slate-950',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    buttonColor: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
  },
  {
    id: 3,
    badge: 'High-Fidelity Audio & Tech • Top Rated',
    title: 'Smart Electronics, ANC Audio & Gear',
    subtitle: 'Immerse yourself in pure acoustics with active noise-cancelling headphones, AMOLED smartwatches, and mechanical keyboards.',
    ctaText: 'Discover Electronics',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
    accentColor: 'from-cyan-500/25 via-slate-900/80 to-slate-950',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    buttonColor: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
  },
  {
    id: 4,
    badge: 'Aesthetic Living • Free Delivery Above ₹999',
    title: 'Modern Home Decor, Planters & Ambient Lighting',
    subtitle: 'Transform your room into a peaceful sanctuary with ultrasonic ceramic diffusers, indoor ceramic planters, and warm desk lamps.',
    ctaText: 'Shop Home Decor',
    category: 'Home & Lifestyle',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    accentColor: 'from-teal-500/25 via-slate-900/80 to-slate-950',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    buttonColor: 'bg-teal-400 hover:bg-teal-300 text-slate-950',
  },
];

const HeroCarousel = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-play slider every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handleCtaClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
  };

  return (
    <div
      className="relative mx-4 sm:mx-6 lg:mx-8 mt-4 overflow-hidden rounded-3xl shadow-2xl border border-slate-800 bg-slate-950 text-white group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative h-[420px] sm:h-[460px] lg:h-[490px] w-full">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Photo with Parallax/Zoom */}
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              {/* Gradient Dark Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor} opacity-95`} />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

              {/* Slide Content */}
              <div className="relative h-full max-w-6xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-start z-20">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold mb-4 backdrop-blur-md shadow-sm transition-all duration-700 delay-100 ${
                    slide.badgeColor
                  } ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.badge}</span>
                </div>

                <h1
                  className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-2xl transition-all duration-700 delay-200 ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                >
                  {slide.title}
                </h1>

                <p
                  className={`mt-4 text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl leading-relaxed transition-all duration-700 delay-300 ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                >
                  {slide.subtitle}
                </p>

                {/* Call to Action Buttons */}
                <div
                  className={`mt-7 flex flex-wrap items-center gap-3.5 transition-all duration-700 delay-400 ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                >
                  <button
                    onClick={() => handleCtaClick(slide.category)}
                    className={`${slide.buttonColor} font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition transform active:scale-95`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCtaClick('All')}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm backdrop-blur-sm transition border border-white/15"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-slate-700/60 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-slate-700/60 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/40">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index
                ? 'w-7 h-2 bg-emerald-400'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Bottom Trust Assurance Bar (Inside Hero Footer) */}
      <div className="relative z-20 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-3.5 hidden md:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Cash on Delivery (COD) Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Free Express Delivery Above ₹999</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>7-Day Easy Returns & Exchange</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Genuine Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
