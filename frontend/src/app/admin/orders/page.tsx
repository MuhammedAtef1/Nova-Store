"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Eye, Printer } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    // 1: Created, 2: Preparing, 3: Prepared, 5: InTransit, 6: Delivered, 7: Cancelled
    switch (status) {
      case 1: return "bg-blue-100 text-blue-700";
      case 2:
      case 3: return "bg-orange-100 text-orange-700";
      case 5: return "bg-purple-100 text-purple-700";
      case 6: return "bg-green-100 text-green-700";
      case 7: return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: number) => {
    const statuses = ["", "Created", "Preparing", "Prepared", "ShipmentAdded", "In Transit", "Delivered", "Cancelled"];
    return statuses[status] || "Unknown";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Orders</h1>
      </div>

      <div className="bg-background border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
          <input 
            type="text" 
            placeholder="Search orders (Order #, Name, Phone)..." 
            className="input w-80 max-w-sm"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders found.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Order #</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono font-medium">{o.orderNumber}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{o.primaryPhone}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{o.total.toFixed(2)} EGP</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${getStatusColor(o.status)}`}>
                      {getStatusText(o.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/orders/${o.orderNumber}`} className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/orders/${o.orderNumber}/print`} target="_blank" className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded">
                        <Printer className="w-4 h-4" />
                      </Link>
                    </div>
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
