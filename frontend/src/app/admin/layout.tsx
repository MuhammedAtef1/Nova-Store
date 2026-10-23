"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Tag, LogOut, Settings, SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkSession, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check session on mount to see if cookie is valid
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (pathname === '/admin/login' || pathname.endsWith('/print')) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Authenticating...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-vini-black text-white shrink-0 flex flex-col min-h-[100dvh]">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="text-xl font-bold tracking-widest uppercase flex items-center gap-2">
            NØVA <span className="text-xs text-gray-400 font-normal mt-1">Admin</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/admin' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link 
            href="/admin/orders" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.startsWith('/admin/orders') ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
          </Link>
          <Link 
            href="/admin/products" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.startsWith('/admin/products') ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Package className="w-5 h-5" /> Products
          </Link>
          <Link 
            href="/admin/categories" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.startsWith('/admin/categories') ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Tag className="w-5 h-5" /> Categories
          </Link>
          <Link 
            href="/admin/landing-page" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.startsWith('/admin/landing-page') ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <SlidersHorizontal className="w-5 h-5" /> Landing Page
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname.startsWith('/admin/settings') ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>

        <div className="w-full p-4 border-t border-gray-800 mt-auto">
          <button 
            onClick={async () => {
              await logout();
              router.push('/admin/login');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Admin...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
