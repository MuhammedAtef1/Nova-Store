export interface CartItem {
  id: string;
  productVariantId: string;
  productName: string;
  productSlug: string;
  sku: string;
  color: string;
  size: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  subtotal: number;
  items: CartItem[];
}
