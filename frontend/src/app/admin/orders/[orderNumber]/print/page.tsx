"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

// Since it's a print view, we strip away all standard layout navigation
export default function PrintOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${params.orderNumber}`);
        setOrder(response.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (params.orderNumber) {
      fetchOrder();
    }
  }, [params.orderNumber]);

  useEffect(() => {
    if (order) {
      // Auto trigger print dialog when loaded
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order]);

  if (loading) return <div className="p-10">Loading document...</div>;
  if (!order) return <div className="p-10 text-red-500">Order not found.</div>;

  return (
    <div className="bg-white min-h-screen text-black p-8 print:p-0">
      <div className="max-w-[210mm] mx-auto bg-white p-[10mm] print:p-0 print:shadow-none shadow-md border print:border-none text-sm">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-black">
          <div>
            <h1 className="text-4xl font-bold tracking-widest uppercase">NØVA</h1>
            <p className="text-gray-500 mt-1 uppercase tracking-wider text-xs">Elevated Essentials</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-wider">Invoice</h2>
            <p className="mt-2 font-mono">#{order.orderNumber}</p>
            <p className="text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-3 uppercase tracking-wider text-xs">Billed To</h3>
            <p className="font-semibold">{order.customerName}</p>
            <p>{order.primaryPhone}</p>
            {order.customerEmail && <p>{order.customerEmail}</p>}
          </div>
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-3 uppercase tracking-wider text-xs">Shipping Address</h3>
            <p>{order.addressLine}</p>
            <p>{order.city}, {order.governorate}</p>
            <p className="mt-2 text-xs uppercase tracking-wider font-semibold">Payment: COD</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black uppercase tracking-wider text-xs">
              <th className="py-2">Item</th>
              <th className="py-2">SKU</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-3">
                  <span className="font-semibold">{item.productName}</span>
                  <br />
                  <span className="text-xs text-gray-500">{item.color} / {item.size}</span>
                </td>
                <td className="py-3 font-mono text-xs">{item.sku}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">{item.unitPrice.toFixed(2)} EGP</td>
                <td className="py-3 text-right font-semibold">{item.lineTotal.toFixed(2)} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{order.subtotal.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{order.shippingFee.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-black font-bold text-lg">
              <span>Total</span>
              <span>{order.total.toFixed(2)} EGP</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-300 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-black uppercase tracking-wider">Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact support@nova.store</p>
          <p>www.nova.store</p>
        </div>
      </div>
    </div>
  );
}
