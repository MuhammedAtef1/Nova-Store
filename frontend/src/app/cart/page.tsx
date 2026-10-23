"use client";

import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function CartPage() {
  const { cart, fetchCart, updateQuantity, removeFromCart, isLoading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && !cart) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg">
        <h1 className="text-3xl font-bold tracking-wider mb-6">YOUR CART</h1>
        <p className="text-muted-foreground mb-10">Your shopping cart is currently empty.</p>
        <Link href="/products" className="btn btn-primary w-full h-12 uppercase tracking-widest font-semibold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-wider mb-10">SHOPPING CART</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-6 gap-4 border-b pb-4 mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Product</div>
            <div className="col-span-1 text-center">Price</div>
            <div className="col-span-1 text-center">Quantity</div>
            <div className="col-span-1 text-right">Total</div>
          </div>

          {/* Cart Items */}
          <div className="space-y-6">
            {cart.items.map(item => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center border-b pb-6">
                
                {/* Product Info */}
                <div className="col-span-1 md:col-span-3 flex gap-4">
                  <Link href={`/products/${item.productSlug}`} className="w-24 h-32 bg-muted shrink-0 overflow-hidden relative">
                    {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl)} alt={item.productName} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-muted-foreground flex h-full w-full items-center justify-center">No Image</span>
                    )}
                  </Link>
                  <div className="flex flex-col justify-center py-2">
                    <Link href={`/products/${item.productSlug}`} className="font-semibold hover:underline mb-1">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-1">Color: {item.color}</p>
                    <p className="text-sm text-muted-foreground mb-3">Size: {item.size}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 w-fit"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="hidden md:block col-span-1 text-center font-medium">
                  {item.unitPrice} EGP
                </div>

                {/* Quantity */}
                <div className="col-span-1 flex items-center justify-between md:justify-center">
                  <div className="md:hidden font-medium text-sm text-muted-foreground">Qty:</div>
                  <div className="flex items-center border h-10 w-24">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={item.quantity <= 1 || isLoading}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 h-full flex items-center justify-center text-sm font-medium border-x">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-1 flex justify-between md:justify-end font-semibold">
                  <span className="md:hidden">Total:</span>
                  <span>{item.lineTotal} EGP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-muted/30 border p-6">
            <h2 className="text-lg font-bold tracking-wider mb-6">ORDER SUMMARY</h2>
            
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{cart.subtotal} EGP</span>
            </div>
            
            <div className="flex justify-between mb-6 text-sm pb-6 border-b">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-right">Calculated at checkout</span>
            </div>
            
            <div className="flex justify-between mb-8 text-lg font-bold">
              <span>Total</span>
              <span>{cart.subtotal} EGP</span>
            </div>
            
            <Link href="/checkout" className="btn btn-primary w-full h-12 uppercase tracking-widest font-semibold flex justify-center items-center">
              Proceed to Checkout
            </Link>
            
            <div className="mt-6 text-center">
              <Link href="/products" className="text-sm underline text-muted-foreground hover:text-foreground">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
