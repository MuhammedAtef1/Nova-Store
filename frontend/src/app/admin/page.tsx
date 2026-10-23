"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Package, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<DashboardStats>('/admin/dashboard/stats');
        setStats(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-wider mb-8 uppercase">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-background border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Revenue</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} <span className="text-sm text-muted-foreground font-normal">EGP</span></div>
        </div>

        <div className="bg-background border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Orders</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
        </div>

        <div className="bg-background border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Pending Orders</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.pendingOrders}</div>
        </div>

        <div className="bg-background border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Active Products</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.totalProducts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-background border shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold tracking-wider uppercase">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">View All</Link>
          </div>
          <div className="p-6 text-sm text-muted-foreground text-center">
            (Order list table will be implemented in the next phase)
          </div>
        </div>

        <div className="bg-background border shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold tracking-wider uppercase">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link href="/admin/products/new" className="btn btn-outline text-sm h-12 uppercase tracking-widest font-semibold flex items-center justify-center">
              Add Product
            </Link>
            <Link href="/admin/categories/new" className="btn btn-outline text-sm h-12 uppercase tracking-widest font-semibold flex items-center justify-center">
              Add Category
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
