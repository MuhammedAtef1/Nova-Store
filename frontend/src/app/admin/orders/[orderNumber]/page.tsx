"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { ArrowLeft, Printer, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function OrderDetailsPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/admin/orders/${orderNumber}`);
      setOrder(data);
    } catch (e) {
      console.error(e);
      alert("Order not found");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: number) => {
    if (!confirm("Are you sure you want to change the status?")) return;
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${orderNumber}/status`, { status: newStatus });
      fetchOrder();
    } catch (e: any) {
      alert(e.response?.data || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading order...</div>;
  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 border rounded hover:bg-muted"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Order #{order.orderNumber}</h1>
        </div>
        <Link href={`/admin/orders/${order.orderNumber}/print`} target="_blank" className="btn btn-outline gap-2 h-10 px-6 uppercase tracking-wider font-semibold">
          <Printer className="w-4 h-4" /> Print Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-background border shadow-sm p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Items Ordered</h2>
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <div className="font-semibold">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.color} / {item.size}</div>
                    </td>
                    <td className="py-3 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right font-semibold">{item.lineTotal.toFixed(2)} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{order.subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shippingFee.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background border shadow-sm p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Update Status</h2>
            <div className="flex flex-wrap gap-4">
              <button 
                disabled={updating || order.status >= 3} 
                onClick={() => updateStatus(3)} 
                className="btn btn-outline border-orange-200 hover:bg-orange-50 text-orange-700 disabled:opacity-50"
              >
                Mark as Prepared
              </button>
              <button 
                disabled={updating || order.status >= 5} 
                onClick={() => updateStatus(5)} 
                className="btn btn-outline border-purple-200 hover:bg-purple-50 text-purple-700 disabled:opacity-50 gap-2"
              >
                <Truck className="w-4 h-4"/> Mark as In Transit
              </button>
              <button 
                disabled={updating || order.status >= 6} 
                onClick={() => updateStatus(6)} 
                className="btn btn-outline border-green-200 hover:bg-green-50 text-green-700 disabled:opacity-50 gap-2"
              >
                <CheckCircle className="w-4 h-4"/> Mark as Delivered
              </button>
              <button 
                disabled={updating || order.status === 7} 
                onClick={() => updateStatus(7)} 
                className="btn btn-outline border-red-200 hover:bg-red-50 text-red-700 disabled:opacity-50 gap-2"
              >
                <XCircle className="w-4 h-4"/> Cancel Order
              </button>
            </div>
          </div>

        </div>

        <div className="space-y-8">
          
          <div className="bg-background border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Customer Details</h2>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contact</p>
              <p className="font-mono">{order.primaryPhone}</p>
              {order.customerEmail && <p>{order.customerEmail}</p>}
            </div>
          </div>

          <div className="bg-background border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2 mb-4">Shipping Address</h2>
            <div>
              <p className="font-medium">{order.addressLine}</p>
              <p>{order.city}, {order.governorate}</p>
            </div>
            {order.deliveryNotes && (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm border border-yellow-200 rounded">
                <span className="font-bold">Notes: </span>{order.deliveryNotes}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
