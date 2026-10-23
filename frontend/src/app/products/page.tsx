import { CatalogService } from "@/services/CatalogService";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const category = typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  
  // Fetch products and categories
  const [productsData, categories] = await Promise.all([
    CatalogService.getProducts(category, search, page, 16),
    CatalogService.getCategories()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-wider uppercase mb-4">
          {category ? category.replace('-', ' ') : search ? `Search: ${search}` : "All Products"}
        </h1>
        {productsData.totalCount > 0 && (
          <p className="text-muted-foreground text-sm">
            Showing {productsData.items.length} of {productsData.totalCount} products
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-semibold mb-4 tracking-wider uppercase text-sm">Categories</h3>
            <ul className="space-y-3 mb-8">
              <li>
                <Link 
                  href="/products"
                  className={`text-sm ${!category ? 'font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=new-arrivals"
                  className={`text-sm ${category === 'new-arrivals' ? 'font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  New Arrivals
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link 
                    href={`/products?category=${c.slug}`}
                    className={`text-sm ${category === c.slug ? 'font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Simple Search Form (Client-side progressive enhancement or server-side simple form) */}
            <form action="/products" method="GET" className="relative">
              <input 
                type="text" 
                name="search" 
                placeholder="Search products..." 
                defaultValue={search || ''}
                className="input pr-10"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {productsData.items.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
              {productsData.items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria.</p>
              <Link href="/products" className="btn btn-outline">
                Clear Filters
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {productsData.totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              {productsData.hasPreviousPage && (
                <Link 
                  href={`/products?${new URLSearchParams({
                    ...(category && { category }),
                    ...(search && { search }),
                    page: (productsData.pageNumber - 1).toString()
                  }).toString()}`}
                  className="btn btn-outline"
                >
                  Previous
                </Link>
              )}
              
              <span className="text-sm font-medium px-4">
                Page {productsData.pageNumber} of {productsData.totalPages}
              </span>

              {productsData.hasNextPage && (
                <Link 
                  href={`/products?${new URLSearchParams({
                    ...(category && { category }),
                    ...(search && { search }),
                    page: (productsData.pageNumber + 1).toString()
                  }).toString()}`}
                  className="btn btn-outline"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
