"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

export default function CartIcon() {
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Link href="/cart" className="p-2 hover:text-muted-foreground transition-colors relative" aria-label="Cart">
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
