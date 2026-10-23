"use client";

import { useEffect, useState, use } from "react";
import { api, BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Trash2, Plus } from "lucide-react";
import Link from "next/link";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/admin/products/${id}`);
      setProduct(data);
    } catch (e) {
      console.error(e);
      alert("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/products/${id}`, product);
      alert("Product saved successfully!");
    } catch (err) {
      alert("Error saving product.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/admin/products/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchProduct();
    } catch (err) {
      alert("Image upload failed. Note: Requires configured backend permissions.");
    }
  };

  const addVariant = async () => {
    try {
      await api.post(`/admin/products/${id}/variants`, {
        sku: `NOVA-${Math.floor(Math.random()*10000)}`,
        color: "Black",
        size: "M",
        stockQuantity: 10,
        isActive: true
      });
      fetchProduct();
    } catch (e) {
      alert("Failed to add variant.");
    }
  };

  const deleteVariant = async (vid: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/products/${id}/variants/${vid}`);
      fetchProduct();
    } catch (e) {
      alert("Failed to delete variant.");
    }
  };

  const deleteImage = async (imageId: string) => {
    if(!confirm("Are you sure you want to delete this image?")) return;
    try {
      await api.delete(`/admin/products/${id}/images/${imageId}`);
      fetchProduct();
    } catch (e) {
      alert("Failed to delete image.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 border rounded hover:bg-muted"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Edit Product</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary gap-2 h-10 px-6 uppercase tracking-wider font-semibold">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Info */}
          <div className="bg-background border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">General Info</h2>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">Name</label>
              <input type="text" className="input" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">Description</label>
              <textarea className="input h-32 py-2" value={product.description || ''} onChange={e => setProduct({...product, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2">Base Price (EGP)</label>
                <input type="number" className="input" value={product.basePrice} onChange={e => setProduct({...product, basePrice: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2">Sale Price (EGP)</label>
                <input type="number" className="input" value={product.salePrice || ''} onChange={e => setProduct({...product, salePrice: e.target.value ? parseFloat(e.target.value) : null})} />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-background border shadow-sm p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Variants & Inventory</h2>
            
            <div className="flex gap-2 mb-6 items-end bg-muted/50 p-4 rounded border">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase mb-1">Color</label>
                <input type="text" id="newColor" placeholder="e.g. Black" className="input py-1.5 text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase mb-1">Size</label>
                <input type="text" id="newSize" placeholder="e.g. M" className="input py-1.5 text-sm" />
              </div>
              <div className="w-24">
                <label className="block text-xs font-bold uppercase mb-1">Stock</label>
                <input type="number" id="newStock" defaultValue={10} className="input py-1.5 text-sm" />
              </div>
              <button onClick={async () => {
                const c = (document.getElementById('newColor') as HTMLInputElement).value || 'Black';
                const s = (document.getElementById('newSize') as HTMLInputElement).value || 'M';
                const q = parseInt((document.getElementById('newStock') as HTMLInputElement).value) || 0;
                try {
                  await api.post(`/admin/products/${id}/variants`, {
                    sku: `NOVA-${Math.floor(Math.random()*10000)}`, color: c, size: s, stockQuantity: q, isActive: true
                  });
                  fetchProduct();
                } catch(e) {
                  alert("Failed to add variant. Ensure the Color + Size combination is unique.");
                }
              }} className="btn btn-outline h-9 px-4 text-xs font-bold uppercase gap-1 shrink-0"><Plus className="w-3 h-3"/> Add</button>
            </div>
            
            {product.variants.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No variants added yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-2">SKU</th>
                    <th className="py-2">Color</th>
                    <th className="py-2">Size</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v: any) => (
                    <tr key={v.id} className="border-b">
                      <td className="py-3 font-mono">{v.sku}</td>
                      <td className="py-3">{v.color}</td>
                      <td className="py-3">{v.size}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${v.stockQuantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => deleteVariant(v.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        <div className="space-y-8">
          
          {/* Status */}
          <div className="bg-background border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Status</h2>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={product.isPublished} onChange={e => setProduct({...product, isPublished: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Published</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">If unchecked, this product will be hidden from the storefront.</p>
            </div>
          </div>

          {/* Images */}
          <div className="bg-background border shadow-sm p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Images</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {product.images.map((img: any) => (
                <div key={img.id} className="relative group aspect-square bg-muted rounded border overflow-hidden">                  <button onClick={() => deleteImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 className="w-4 h-4" /></button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            
            <label className="btn btn-outline w-full flex justify-center items-center gap-2 cursor-pointer uppercase tracking-wider font-semibold text-sm">
              <Upload className="w-4 h-4" />
              Upload Image
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}
