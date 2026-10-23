"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, Edit2, Archive, Settings } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary gap-2 h-10 px-6 uppercase tracking-wider font-semibold">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-background border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="input w-64 max-w-sm"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No products found.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Price</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.categoryName}</td>
                  <td className="px-6 py-4">{p.basePrice} EGP</td>
                  <td className="px-6 py-4">
                    {p.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/products/${p.id}`} className="p-2 inline-flex text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
