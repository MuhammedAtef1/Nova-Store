"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/api";

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  linkUrl?: string;
  textPosition?: "right" | "left" | "center";
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    imageUrl: "/images/categories/winter.jpg",
    title: "NEW COLLECTION WINTER",
    subtitle: "Modern minimalism crafted for cold season elegance.",
    buttonText: "SHOP NOW",
    linkUrl: "/products?category=winter-collection",
    textPosition: "right"
  }
];

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Auto-play when there are multiple slides
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [activeSlides.length, isPaused, nextSlide]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section 
      className="relative w-full h-[75vh] sm:h-[82vh] lg:h-[88vh] overflow-hidden bg-vini-black text-white group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      {activeSlides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-105"
            } transition-transform duration-1000`}
          >
            {slide.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(slide.imageUrl)}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-neutral-900 to-black" />
            )}

            {/* Gradient Scrim for contrast & readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/80" />
          </div>
        );
      })}

      {/* Slide Text Content */}
      <div className="relative z-20 container mx-auto h-full px-6 sm:px-12 flex items-center">
        <div 
          className={`w-full flex ${
            currentSlide.textPosition === "left" 
              ? "justify-start text-left" 
              : currentSlide.textPosition === "center" 
                ? "justify-center text-center" 
                : "justify-end text-right"
          }`}
        >
          <div className="max-w-xl py-8 px-6 sm:px-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
            <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold text-zinc-300 mb-3">
              NØVA Season Exclusive
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-4 leading-none">
              {currentSlide.title || "NEW COLLECTION WINTER"}
            </h1>
            {currentSlide.subtitle && (
              <p className="text-sm sm:text-base text-zinc-300 mb-8 font-light leading-relaxed">
                {currentSlide.subtitle}
              </p>
            )}
            <div>
              <Link
                href={currentSlide.linkUrl || "/products"}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-black text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                {currentSlide.buttonText || "SHOP NOW"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (shown if multiple slides) */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  currentIndex === idx
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
