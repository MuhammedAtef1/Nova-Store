"use client";

import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import CartIcon from "./CartIcon";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function Header({ announcementText = "FREE SHIPPING ON ORDERS OVER 500 EGP" }: { announcementText?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-vini-white/95 dark:bg-[#121212]/95 backdrop-blur-md">
      {/* Announcement Bar */}
      {announcementText && (
        <div className="bg-foreground text-background py-1.5 px-4 text-center text-xs font-semibold tracking-wider">
          {announcementText}
        </div>
      )}
      
      {/* Main Nav Bar */}
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between relative">
        {/* Left Column: Navigation Links (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-6 flex-1 justify-start">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 -ml-2 lg:hidden hover:text-muted-foreground transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            <Link href="/" className="hover:text-muted-foreground transition-colors">
              Home
            </Link>
            <Link href="/products?category=winter-collection" className="hover:text-muted-foreground transition-colors">
              Winter
            </Link>
            <Link href="/products?category=summer-collection" className="hover:text-muted-foreground transition-colors">
              Summer
            </Link>
            <Link 
              href="/products?sale=true" 
              className="text-red-600 dark:text-red-400 font-bold tracking-widest hover:opacity-80 transition-opacity"
            >
              SALE
            </Link>
          </nav>
        </div>

        {/* Center Column: Logo */}
        <div className="flex items-center justify-center shrink-0">
          <Link href="/" className="flex items-center group py-1" aria-label="NØVA Home">
            <span className="text-2xl sm:text-3xl font-black tracking-[0.28em] uppercase font-sans text-foreground transition-all duration-300 group-hover:tracking-[0.32em] group-hover:opacity-90 select-none">
              NØVA
            </span>
          </Link>
        </div>

        {/* Right Column: User / Login + Cart */}
        <div className="flex items-center justify-end gap-3 sm:gap-6 flex-1">
          <Link 
            href={isAuthenticated ? "/admin" : "/admin/login"} 
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:text-muted-foreground transition-colors py-1.5 px-2.5 rounded-md hover:bg-muted/50"
            aria-label="Account Login"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">
              {isAuthenticated ? "Admin" : "Login"}
            </span>
          </Link>

          <CartIcon />
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/98 backdrop-blur-md px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-bold uppercase tracking-wider">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/50 hover:text-muted-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/products?category=winter-collection" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/50 hover:text-muted-foreground transition-colors"
            >
              Winter Collection
            </Link>
            <Link 
              href="/products?category=summer-collection" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/50 hover:text-muted-foreground transition-colors"
            >
              Summer Collection
            </Link>
            <Link 
              href="/products?sale=true" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/50 text-red-600 dark:text-red-400 font-bold transition-colors"
            >
              SALE & OFFERS
            </Link>
            <Link 
              href="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              All Products
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
