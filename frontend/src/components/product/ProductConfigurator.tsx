"use client";

import { useState } from "react";
import { ProductDetail, ProductVariant } from "@/types/catalog";
import { Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface ProductConfiguratorProps {
  product: ProductDetail;
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  // Extract unique colors and sizes from active variants
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);

  // Find the exact variant based on selection
  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  const { addToCart, isLoading } = useCartStore();

  const isAvailable = selectedVariant?.inStock ?? false;
  
  // Price might change based on variant override
  const displayPrice = selectedVariant?.priceOverride ?? product.effectivePrice;
  const hasDiscount = !selectedVariant?.priceOverride && product.salePrice && product.salePrice < product.basePrice;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    try {
      await addToCart(selectedVariant.id, quantity);
      alert(`Added ${quantity} of ${product.name} (${selectedSize} / ${selectedColor}) to cart!`);
    } catch (error) {
      alert('Failed to add item to cart. It might be out of stock.');
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Price */}
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold">{displayPrice} EGP</span>
        {hasDiscount && (
          <span className="text-muted-foreground line-through text-lg">{product.basePrice} EGP</span>
        )}
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Color: {selectedColor}</h4>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => {
              // Find hex code for this color from variants
              const hex = product.variants.find(v => v.color === color)?.colorHex || "#cccccc";
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-vini-black transition-all ${
                    selectedColor === color ? 'border-vini-black scale-110' : 'border-transparent hover:scale-105 shadow-sm'
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Select color ${color}`}
                  title={color}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Size: {selectedSize}</h4>
            <button className="text-xs text-muted-foreground underline hover:text-foreground">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              // Check if this specific size is available in the currently selected color
              const variantForSize = product.variants.find(v => v.color === selectedColor && v.size === size);
              const isSizeAvailable = variantForSize?.inStock ?? false;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!isSizeAvailable}
                  className={`h-12 min-w-12 px-4 border text-sm font-medium transition-colors ${
                    selectedSize === size 
                      ? 'border-vini-black bg-vini-black text-white' 
                      : isSizeAvailable
                        ? 'border-border hover:border-vini-black'
                        : 'border-border/50 text-muted-foreground/50 bg-muted/30 cursor-not-allowed line-through'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-4 mt-4 border-t pt-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center border h-12">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 h-full flex items-center justify-center text-sm font-medium border-x">
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={!isAvailable || isLoading}
            className="flex-1 btn btn-primary h-12 text-sm uppercase tracking-widest"
          >
            {isLoading ? 'Adding...' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button className="h-12 w-12 border flex items-center justify-center hover:border-vini-black transition-colors" aria-label="Add to Wishlist">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
