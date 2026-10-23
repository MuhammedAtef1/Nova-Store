import { notFound } from "next/navigation";
import Link from "next/link";
import { getImageUrl } from '@/lib/api';
import { CheckCircle2, Package, Truck, Home } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

// Direct fetch since we are in Server Component
async function getOrder(orderNumber: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderNumber}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await connection();
  const { orderNumber } = await params;
  
  const order = await getOrder(orderNumber);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-4">ORDER NOT FOUND</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find an order with the number <span className="font-semibold">{orderNumber}</span>.
        </p>
        <Link href="/" className="btn btn-primary">Return to Store</Link>
      </div>
    );
  }

  // Determine status steps based on OrderStatus enum from backend
  const statuses = [
    { key: "OrderCreated", label: "Order Placed", icon: CheckCircle2 },
    { key: "Preparing", label: "Processing", icon: Package },
    { key: "InTransit", label: "In Transit", icon: Truck },
    { key: "Delivered", label: "Delivered", icon: Home },
  ];

  // Very simplified mapping
  let currentStep = 0;
  if (order.status === "Preparing" || order.status === "Prepared" || order.status === "ShipmentAdded") currentStep = 1;
  else if (order.status === "InTransit") currentStep = 2;
  else if (order.status === "Delivered") currentStep = 3;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-muted/30 border p-8 md:p-12 text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-wider mb-2">THANK YOU FOR YOUR ORDER</h1>
        <p className="text-muted-foreground mb-6">
          Hi {order.customerName.split(' ')[0]}, we have received your order. We will process it shortly.
        </p>
        <div className="text-lg">
          Order Number: <span className="font-bold">{order.orderNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Tracking Timeline */}
        <div>
          <h2 className="text-xl font-bold tracking-wider mb-6 pb-2 border-b">TRACKING STATUS</h2>
          
          <div className="relative pl-4 border-l-2 border-muted space-y-8 mt-8">
            {statuses.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const Icon = step.icon;
              
              return (
                <div key={step.key} className={`relative flex items-center gap-4 ${!isCompleted ? 'opacity-50' : ''}`}>
                  <div className={`absolute -left-[25px] w-8 h-8 rounded-full border-4 flex items-center justify-center bg-background
                    ${isCompleted ? 'border-foreground text-foreground' : 'border-muted text-muted-foreground'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isCurrent ? 'text-lg' : ''}`}>{step.label}</h3>
                    {isCurrent && <p className="text-sm text-muted-foreground">Currently in this stage</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {order.status === "Cancelled" && (
            <div className="mt-8 p-4 bg-red-50 text-red-600 border border-red-200">
              <h3 className="font-bold">Order Cancelled</h3>
              <p className="text-sm mt-1">This order has been cancelled.</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div>
          <h2 className="text-xl font-bold tracking-wider mb-6 pb-2 border-b">ORDER DETAILS</h2>
          
          <div className="space-y-4 mb-8">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                  {item.productImageUrl && <img src={getImageUrl(item.productImageUrl)} alt="" className="object-cover w-full h-full" />}
                </div>
                <div className="flex-1 flex flex-col justify-center text-sm">
                  <span className="font-semibold line-clamp-1">{item.productName}</span>
                  <span className="text-muted-foreground">{item.color} / {item.size}</span>
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                </div>
                <div className="font-medium text-sm pt-1 text-right">
                  {item.lineTotal} EGP
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-muted/30 p-6">
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{order.subtotal} EGP</span>
            </div>
            <div className="flex justify-between mb-4 text-sm pb-4 border-b">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span>{order.shippingFee} EGP</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{order.total} EGP</span>
            </div>
            <div className="mt-4 text-sm text-center text-muted-foreground">
              Payment Method: <strong>Cash on Delivery</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
