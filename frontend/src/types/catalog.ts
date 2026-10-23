export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  effectivePrice: number;
  primaryImageUrl?: string;
  secondaryImageUrl?: string;
  isNewArrival: boolean;
  category: Category;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  priceOverride?: number;
  inStock: boolean;
}

export interface ProductDetail extends ProductSummary {
  description?: string;
  fabricInfo?: string;
  careInstructions?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
