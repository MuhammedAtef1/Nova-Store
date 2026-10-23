import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-black tracking-[0.25em] mb-4">NØVA</h3>
            <p className="text-sm text-gray-400 mb-6">
              Everyday, Elevated. Premium fashion for the modern lifestyle.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase">IG</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase">FB</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase">X</a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/products?category=new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?category=t-shirts" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link href="/products?category=jeans" className="hover:text-white transition-colors">Jeans</Link></li>
              <li><Link href="/products?category=sweatshirts" className="hover:text-white transition-colors">Sweatshirts</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2026 NØVA. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <span className="mr-2">Designed in Egypt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
