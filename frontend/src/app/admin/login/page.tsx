"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      // Error is handled in store and displayed below
    }
  };

  if (isAuthenticated) return null; // Prevent flash

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md p-8 bg-background border shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest uppercase">NØVA Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required 
              className="input w-full" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nova.store"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required 
              className="input w-full" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary w-full h-12 tracking-widest uppercase font-semibold"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
