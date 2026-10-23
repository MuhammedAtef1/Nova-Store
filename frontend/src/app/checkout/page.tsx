"use client";

import { useCartStore } from "@/store/cartStore";
import { api, getImageUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function CheckoutPage() {
  const { cart, fetchCart, isLoading } = useCartStore();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && !cart) return <div className="p-20 text-center">Loading checkout...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-6">CHECKOUT</h1>
        <p className="mb-8">Your cart is empty.</p>
        <button onClick={() => router.push('/products')} className="btn btn-primary w-full">Shop Now</button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      customerName: formData.get("customerName"),
      primaryPhone: formData.get("primaryPhone"),
      secondaryPhone: formData.get("secondaryPhone"),
      customerEmail: formData.get("customerEmail"),
      governorate: formData.get("governorate"),
      city: formData.get("city"),
      addressLine: formData.get("addressLine"),
      deliveryNotes: formData.get("deliveryNotes"),
    };

    try {
      const response = await api.post('/orders/checkout', data);
      const order = response.data;
      
      // Clear cart locally since backend cleared it
      await fetchCart();
      
      // Navigate to order tracking/success page
      router.push(`/track/${order.orderNumber}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-wider mb-10">CHECKOUT</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Form */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 text-sm border border-red-200">
                {error}
              </div>
            )}
            
            {/* Contact Info */}
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                  <input name="customerName" required className="input" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email (Optional)</label>
                  <input name="customerEmail" type="email" className="input" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Primary Phone <span className="text-red-500">*</span></label>
                  <input name="primaryPhone" required className="input" placeholder="01xxxxxxxxx" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Secondary Phone (Optional)</label>
                  <input name="secondaryPhone" className="input" placeholder="01xxxxxxxxx" />
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Governorate <span className="text-red-500">*</span></label>
                  <select name="governorate" required className="input bg-background">
                    <option value="">Select Governorate...</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                    {/* Add more as needed */}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">City / Area <span className="text-red-500">*</span></label>
                  <input name="city" required className="input" placeholder="e.g. Nasr City" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-sm font-medium">Full Address Line <span className="text-red-500">*</span></label>
                  <input name="addressLine" required className="input" placeholder="Street name, building, apartment number" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-sm font-medium">Delivery Notes (Optional)</label>
                  <textarea name="deliveryNotes" className="input min-h-[80px] py-2" placeholder="Any specific instructions for the courier?"></textarea>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Payment Method</h2>
              <div className="p-4 border border-vini-black bg-muted/20 flex items-center gap-3">
                <input type="radio" checked readOnly className="w-4 h-4 text-vini-black accent-vini-black" />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </div>
            </section>
          </form>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5">
          <div className="bg-muted/30 border p-6 sticky top-24">
            <h2 className="text-lg font-bold tracking-wider mb-6">ORDER SUMMARY</h2>
            
            <div className="space-y-4 mb-6 border-b pb-6 max-h-[40vh] overflow-y-auto pr-2">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                    {item.imageUrl && <img src={getImageUrl(item.imageUrl)} alt="" className="object-cover w-full h-full" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-sm">
                    <span className="font-semibold line-clamp-1">{item.productName}</span>
                    <span className="text-muted-foreground">{item.color} / {item.size}</span>
                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                  <div className="font-medium text-sm pt-1">
                    {item.lineTotal} EGP
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{cart.subtotal} EGP</span>
            </div>
            
            <div className="flex justify-between mb-6 text-sm pb-6 border-b">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-right text-muted-foreground text-xs italic">Calculated at next step<br/>(Based on Governorate)</span>
            </div>
            
            <div className="flex justify-between mb-8 text-lg font-bold">
              <span>Estimated Total</span>
              <span>{cart.subtotal} EGP</span>
            </div>
            
            <button 
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full h-12 uppercase tracking-widest font-semibold"
            >
              {isSubmitting ? 'Processing...' : 'Place Order (COD)'}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
