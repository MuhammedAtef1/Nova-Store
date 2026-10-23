"use client";

import Link from "next/link";
import { getImageUrl } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export interface FeaturedCard {
  id: string;
  title: string;
  buttonText?: string;
  linkUrl: string;
  imageUrl: string;
  subtitle?: string;
}

interface FeaturedCollectionsProps {
  cards?: FeaturedCard[];
}

const DEFAULT_CARDS: FeaturedCard[] = [
  {
    id: "card-1",
    title: "Winter Collection",
    buttonText: "Shop Now",
    linkUrl: "/products?category=winter-collection",
    imageUrl: "/images/categories/winter.jpg",
    subtitle: "Heavy fabrics & modern fits"
  },
  {
    id: "card-2",
    title: "Summer Collection",
    buttonText: "Shop Now",
    linkUrl: "/products?category=summer-collection",
    imageUrl: "/images/categories/summer.jpg",
    subtitle: "Lightweight essentials"
  },
  {
    id: "card-3",
    title: "Offers & Sale",
    buttonText: "Shop Now",
    linkUrl: "/products?sale=true",
    imageUrl: "/images/categories/sale.jpg",
    subtitle: "Limited time exclusive pricing"
  }
];

export default function FeaturedCollections({ cards }: FeaturedCollectionsProps) {
  const activeCards = cards && cards.length === 3 ? cards : DEFAULT_CARDS;

  return (
    <section className="py-16 sm:py-24 container mx-auto px-4 max-w-7xl">
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-muted-foreground block mb-2">
          Featured Lines
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight">
          Curated Collections
        </h2>
      </div>

      {/* 3 Large Portrait Cards (Height > Width: aspect-[3/4]) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {activeCards.map((card) => (
          <Link
            key={card.id}
            href={card.linkUrl || "/products"}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-lg border border-border/40 block"
          >
            {/* Background Image with Zoom on Hover */}
            {card.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(card.imageUrl)}
                alt={card.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-950" />
            )}

            {/* Gradient Overlays for optimal readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:from-black/90" />

            {/* Card Content at bottom */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col items-center text-center z-10">
              {card.subtitle && (
                <span className="text-[11px] uppercase tracking-widest text-zinc-300 mb-1.5 font-medium">
                  {card.subtitle}
                </span>
              )}
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mb-4 drop-shadow">
                {card.title}
              </h3>
              
              <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md group-hover:bg-zinc-200 group-hover:gap-3 group-hover:shadow-xl">
                {card.buttonText || "Shop Now"}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
