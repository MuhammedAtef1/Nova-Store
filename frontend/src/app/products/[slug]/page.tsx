import { CatalogService } from "@/services/CatalogService";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/product/ImageGallery";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let product;
  try {
    product = await CatalogService.getProductBySlug(slug);
  } catch (error) {
    // Return 404 if API throws a 404 (product not found)
    console.error("Failed to fetch product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Images */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Info & Configurator */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
          
          <ProductConfigurator product={product} />

          <div className="mt-12 space-y-8 border-t pt-8 text-sm">
            {/* Description */}
            {product.description && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
            
            {/* Fabric Info */}
            {product.fabricInfo && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider mb-2">Fabric & Fit</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.fabricInfo}
                </p>
              </div>
            )}

            {/* Care Instructions */}
            {product.careInstructions && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider mb-2">Care Instructions</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.careInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
