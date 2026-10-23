import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { ProductSummary } from "@/types/catalog";
import { getImageUrl } from "@/lib/api";

interface ProductCardProps {
  product: ProductSummary;
}

export default function ProductCard({ product }: ProductCardProps) {
  // If no image is provided, use a placeholder logic (or generic grey box)
  const imageSrc = getImageUrl(product.primaryImageUrl);
  const hoverImageSrc = getImageUrl(product.secondaryImageUrl || product.primaryImageUrl);
  
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

  return (
    <div className="group flex flex-col relative">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNewArrival && (
          <span className="bg-background text-foreground text-[10px] font-bold px-2 py-1 tracking-widest uppercase shadow-sm">
            New
          </span>
        )}
        {hasDiscount && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase shadow-sm">
            Sale
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        className="absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-red-500 transition-colors bg-white/50 hover:bg-white rounded-full opacity-0 group-hover:opacity-100"
        aria-label="Add to wishlist"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Images */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-muted mb-4 block">
        {/* We would use Next/Image here, but since images might be external/local, we just use a standard img or unoptimized Next Image for now */}
        {product.primaryImageUrl ? (
          <>
            <img 
              src={imageSrc} 
              alt={product.name} 
              className="object-cover w-full h-full transition-opacity duration-500 group-hover:opacity-0"
            />
            {product.secondaryImageUrl && (
               <img 
                 src={hoverImageSrc} 
                 alt={`${product.name} alternate view`} 
                 className="absolute inset-0 object-cover w-full h-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
               />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:underline mb-1 line-clamp-1">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {hasDiscount ? (
            <>
              <span className="text-red-600 font-semibold">{product.effectivePrice} EGP</span>
              <span className="text-muted-foreground line-through text-xs">{product.basePrice} EGP</span>
            </>
          ) : (
            <span className="font-semibold">{product.basePrice} EGP</span>
          )}
        </div>
      </div>
    </div>
  );
}
