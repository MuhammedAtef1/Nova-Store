import Link from "next/link";
import { CatalogService } from "@/services/CatalogService";
import ProductCard from "@/components/product/ProductCard";
import HeroCarousel, { HeroSlide } from "@/components/home/HeroCarousel";
import FeaturedCollections, { FeaturedCard } from "@/components/home/FeaturedCollections";
import { ProductSummary } from "@/types/catalog";
import { connection } from "next/server";

export const instant = false;

export default async function Home() {
  await connection();
  // Fetch data concurrently on the server
  let featuredProducts: ProductSummary[] = [];
  let newArrivals: ProductSummary[] = [];
  let settings: any[] = [];
  
  try {
    const [featured, newArr, sets] = await Promise.all([
      CatalogService.getFeaturedProducts(),
      CatalogService.getNewArrivals(),
      CatalogService.getSettings()
    ]);
    featuredProducts = featured;
    newArrivals = newArr;
    settings = sets;
  } catch (error) {
    console.error("Failed to fetch homepage data", error);
  }

  // Parse Hero Slides
  let heroSlides: HeroSlide[] = [];
  const heroSlidesRaw = settings.find(s => s.key === "Landing_HeroSlides")?.value;
  if (heroSlidesRaw) {
    try {
      heroSlides = JSON.parse(heroSlidesRaw);
    } catch {
      heroSlides = [];
    }
  }

  // Parse Featured Collections Cards
  let featuredCards: FeaturedCard[] = [];
  const featuredCardsRaw = settings.find(s => s.key === "Landing_FeaturedCards")?.value;
  if (featuredCardsRaw) {
    try {
      featuredCards = JSON.parse(featuredCardsRaw);
    } catch {
      featuredCards = [];
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Full-Width Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* 2. Three Large Portrait Featured Cards (Winter, Summer, Offers) */}
      <FeaturedCollections cards={featuredCards} />

      {/* 3. Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-16 sm:py-20 container mx-auto px-4 max-w-7xl border-t">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-muted-foreground block mb-1">
                Handpicked Essentials
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link 
              href="/products" 
              className="text-xs sm:text-sm font-bold uppercase tracking-wider hover:underline text-muted-foreground hidden sm:block"
            >
              View All ({featuredProducts.length})
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. New Arrivals Grid */}
      {newArrivals.length > 0 && (
        <section className="py-16 sm:py-20 container mx-auto px-4 max-w-7xl border-t bg-muted/20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-muted-foreground block mb-1">
                Latest Drops
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link 
              href="/products?category=new-arrivals" 
              className="text-xs sm:text-sm font-bold uppercase tracking-wider hover:underline text-muted-foreground hidden sm:block"
            >
              View All ({newArrivals.length})
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
