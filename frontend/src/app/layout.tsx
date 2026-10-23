export const instant = false;

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

import { CatalogService } from "@/services/CatalogService";

export const metadata: Metadata = {
  title: "NØVA | Everyday, Elevated",
  description: "Premium fashion for the modern lifestyle.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let announcement = "FREE SHIPPING ON ORDERS OVER 500 EGP";
  try {
    const settings = await CatalogService.getSettings();
    const ann = settings.find(s => s.key === "AnnouncementText");
    if (ann) announcement = ann.value;
  } catch (e) {
    // Ignore if api is down
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Header announcementText={announcement} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
