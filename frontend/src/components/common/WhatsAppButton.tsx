"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function WhatsAppButton({ 
  initialNumber = "+201000000000",
  initialMessage = "مرحبا NØVA، أود الاستفسار عن تفاصيل الطلب والمنتجات"
}: { 
  initialNumber?: string;
  initialMessage?: string;
}) {
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [greetingMessage, setGreetingMessage] = useState(initialMessage);

  useEffect(() => {
    async function loadWhatsAppSettings() {
      try {
        const { data } = await api.get("/catalog/settings");
        if (Array.isArray(data)) {
          const numSetting = data.find((s: any) => s.key === "WhatsAppNumber");
          const msgSetting = data.find((s: any) => s.key === "WhatsAppGreeting");
          if (numSetting?.value) setPhoneNumber(numSetting.value);
          if (msgSetting?.value) setGreetingMessage(msgSetting.value);
        }
      } catch (err) {
        // Fallback to initial values
      }
    }
    loadWhatsAppSettings();
  }, []);

  // Clean phone number (remove +, -, spaces)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greetingMessage)}`;

  return (
    <aside aria-label="Customer Support WhatsApp" className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip on hover */}
      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-x-2 group-hover:translate-x-0 mr-3 hidden sm:inline-block bg-background/95 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-border">
        تحدث معنا على واتساب
      </span>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with NØVA on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Subtle breathing animation ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:animate-none" />

        {/* WhatsApp Icon */}
        <svg 
          className="w-7 h-7 fill-current relative z-10" 
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.777.814 2.791.814 3.179 0 5.766-2.587 5.766-5.766 0-3.18-2.587-5.766-5.766-5.766zm9.969 5.766c0 5.485-4.464 9.948-9.95 9.948-1.748 0-3.376-.453-4.797-1.246l-5.253 1.36 1.399-5.116c-.897-1.488-1.41-3.23-1.41-5.092 0-5.484 4.465-9.948 9.95-9.948 5.485 0 10.061 4.464 10.061 9.948zm-5.467 4.148c-.287-.144-1.696-.837-1.959-.933-.263-.096-.454-.144-.645.144-.191.288-.741.933-.909 1.124-.167.192-.335.216-.622.072-.287-.144-1.21-.446-2.305-1.423-.852-.76-1.427-1.7-1.595-1.988-.167-.288-.018-.444.126-.587.13-.129.287-.335.431-.503.144-.168.192-.288.288-.479.096-.192.048-.36-.024-.503-.072-.144-.645-1.554-.884-2.129-.233-.56-.47-.484-.645-.493-.167-.009-.359-.011-.55-.011-.192 0-.503.072-.766.36-.263.288-1.005.982-1.005 2.395 0 1.413 1.029 2.779 1.173 2.971.144.192 2.025 3.093 4.906 4.339.686.296 1.221.473 1.638.605.688.219 1.314.188 1.808.114.551-.082 1.696-.693 1.935-1.362.239-.67.239-1.244.168-1.363-.072-.119-.263-.191-.55-.335z"/>
        </svg>
      </a>
    </aside>
  );
}
