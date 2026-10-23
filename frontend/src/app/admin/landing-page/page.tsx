"use client";

import { useEffect, useState } from "react";
import { api, BASE_URL } from "@/lib/api";
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  ExternalLink, 
  Phone, 
  Layers, 
  SlidersHorizontal,
  CheckCircle,
  Eye
} from "lucide-react";

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  linkUrl?: string;
  textPosition?: "right" | "left" | "center";
}

interface FeaturedCard {
  id: string;
  title: string;
  buttonText: string;
  linkUrl: string;
  imageUrl: string;
  subtitle?: string;
}

export default function AdminLandingPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "cards" | "whatsapp">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // States
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [cards, setCards] = useState<FeaturedCard[]>([]);
  const [whatsAppNumber, setWhatsAppNumber] = useState("+201000000000");
  const [whatsAppGreeting, setWhatsAppGreeting] = useState("مرحبا NØVA، أود الاستفسار عن تفاصيل الطلب والمنتجات");

  useEffect(() => {
    fetchLandingSettings();
  }, []);

  const fetchLandingSettings = async () => {
    try {
      const { data } = await api.get("/admin/settings");
      if (Array.isArray(data)) {
        // Parse Hero Slides
        const slidesSetting = data.find((s: any) => s.key === "Landing_HeroSlides");
        if (slidesSetting?.value) {
          try {
            setSlides(JSON.parse(slidesSetting.value));
          } catch {
            setSlides(getDefaultSlides());
          }
        } else {
          setSlides(getDefaultSlides());
        }

        // Parse Featured Cards
        const cardsSetting = data.find((s: any) => s.key === "Landing_FeaturedCards");
        if (cardsSetting?.value) {
          try {
            setCards(JSON.parse(cardsSetting.value));
          } catch {
            setCards(getDefaultCards());
          }
        } else {
          setCards(getDefaultCards());
        }

        // WhatsApp
        const waNum = data.find((s: any) => s.key === "WhatsAppNumber");
        if (waNum?.value) setWhatsAppNumber(waNum.value);

        const waMsg = data.find((s: any) => s.key === "WhatsAppGreeting");
        if (waMsg?.value) setWhatsAppGreeting(waMsg.value);
      }
    } catch (err) {
      console.error("Failed to load landing settings", err);
      setSlides(getDefaultSlides());
      setCards(getDefaultCards());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSlides = (): HeroSlide[] => [
    {
      id: "1",
      imageUrl: "/images/categories/winter.jpg",
      title: "NEW COLLECTION WINTER",
      subtitle: "Elevated winter essentials designed for the modern lifestyle.",
      buttonText: "SHOP NOW",
      linkUrl: "/products?category=winter-collection",
      textPosition: "right"
    }
  ];

  const getDefaultCards = (): FeaturedCard[] => [
    {
      id: "1",
      title: "Winter Collection",
      buttonText: "Shop Now",
      linkUrl: "/products?category=winter-collection",
      imageUrl: "/images/categories/winter.jpg",
      subtitle: "Heavy fabrics & modern fits"
    },
    {
      id: "2",
      title: "Summer Collection",
      buttonText: "Shop Now",
      linkUrl: "/products?category=summer-collection",
      imageUrl: "/images/categories/summer.jpg",
      subtitle: "Lightweight essentials"
    },
    {
      id: "3",
      title: "Offers & Sale",
      buttonText: "Shop Now",
      linkUrl: "/products?sale=true",
      imageUrl: "/images/categories/sale.jpg",
      subtitle: "Limited time exclusive pricing"
    }
  ];

  // Image Upload helper
  const handleImageUpload = async (file: File, onUploaded: (url: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/admin/settings/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data?.url) {
        onUploaded(data.url);
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    }
  };

  // Add Slide
  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      imageUrl: "",
      title: "NEW ARRIVALS",
      subtitle: "Premium fashion crafted for modern elegance.",
      buttonText: "SHOP NOW",
      linkUrl: "/products",
      textPosition: "right"
    };
    setSlides([...slides, newSlide]);
  };

  // Remove Slide
  const handleRemoveSlide = (id: string) => {
    if (slides.length <= 1) {
      alert("You must keep at least one slide on the landing page.");
      return;
    }
    if (confirm("Are you sure you want to delete this slide?")) {
      setSlides(slides.filter(s => s.id !== id));
    }
  };

  // Update Slide
  const handleUpdateSlide = (id: string, field: keyof HeroSlide, value: any) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Update Featured Card
  const handleUpdateCard = (index: number, field: keyof FeaturedCard, value: any) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  // Save All Settings
  const handleSaveAll = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const payload = [
        {
          key: "Landing_HeroSlides",
          value: JSON.stringify(slides),
          group: "LandingPage"
        },
        {
          key: "Landing_FeaturedCards",
          value: JSON.stringify(cards),
          group: "LandingPage"
        },
        {
          key: "WhatsAppNumber",
          value: whatsAppNumber,
          group: "General"
        },
        {
          key: "WhatsAppGreeting",
          value: whatsAppGreeting,
          group: "General"
        }
      ];

      await api.put("/admin/settings", payload);
      setNotification("All landing page settings were saved successfully! Refresh the storefront to preview.");
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      alert("Failed to save landing page settings.");
    } finally {
      setSaving(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold tracking-wider uppercase text-muted-foreground animate-pulse">
          Loading Landing Page Configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            <SlidersHorizontal className="w-4 h-4" /> Storefront Customizer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
            Landing Page Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your hero carousel banner, 3 featured collections cards, and WhatsApp contact button.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline h-11 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Preview Store
          </a>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="btn btn-primary h-11 px-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notification && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab("hero")}
          className={`py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "hero"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Hero Carousel ({slides.length})
        </button>
        <button
          onClick={() => setActiveTab("cards")}
          className={`py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "cards"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4" /> 3 Featured Collections
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "whatsapp"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="w-4 h-4" /> WhatsApp Contact
        </button>
      </div>

      {/* ================= SECTION 1: HERO SLIDER ================= */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted/40 p-4 rounded-lg border">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider">Hero Carousel Slides</h2>
              <p className="text-xs text-muted-foreground">
                Images display full width with right-aligned text. Multiple slides enable left/right navigation arrows.
              </p>
            </div>
            <button
              onClick={handleAddSlide}
              className="btn btn-outline h-9 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Slide
            </button>
          </div>

          <div className="space-y-6">
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className="bg-background border rounded-xl p-6 shadow-sm space-y-6 relative group"
              >
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    Slide #{index + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Slide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Image Preview & Upload */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider">
                      Slide Background Image
                    </label>
                    <div className="relative aspect-[16/9] bg-muted rounded-lg border overflow-hidden flex items-center justify-center">
                      {slide.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getFullImageUrl(slide.imageUrl)} 
                          alt="Slide preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center p-4 text-muted-foreground text-xs font-medium">
                          No Image Selected
                        </div>
                      )}

                      {uploadingIndex === slide.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                          Uploading...
                        </div>
                      )}
                    </div>

                    {/* Upload / Replace Button */}
                    <label className="btn btn-outline w-full h-9 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {slide.imageUrl ? "Change Image" : "Upload Image"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingIndex(slide.id);
                            await handleImageUpload(file, (newUrl) => {
                              handleUpdateSlide(slide.id, "imageUrl", newUrl);
                              setUploadingIndex(null);
                            });
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Text & Overlay Controls */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Main Title (Large Bold Text)
                      </label>
                      <input 
                        type="text" 
                        className="input w-full text-sm font-semibold uppercase tracking-wider" 
                        value={slide.title} 
                        placeholder="e.g. NEW COLLECTION WINTER"
                        onChange={(e) => handleUpdateSlide(slide.id, "title", e.target.value)} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Subtitle / Description
                      </label>
                      <input 
                        type="text" 
                        className="input w-full text-sm" 
                        value={slide.subtitle || ""} 
                        placeholder="e.g. Modern minimalism crafted for cold days."
                        onChange={(e) => handleUpdateSlide(slide.id, "subtitle", e.target.value)} 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                          Button Text
                        </label>
                        <input 
                          type="text" 
                          className="input w-full text-sm font-semibold uppercase tracking-wider" 
                          value={slide.buttonText || "SHOP NOW"} 
                          placeholder="SHOP NOW"
                          onChange={(e) => handleUpdateSlide(slide.id, "buttonText", e.target.value)} 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                          Button Target URL
                        </label>
                        <input 
                          type="text" 
                          className="input w-full text-sm font-mono" 
                          value={slide.linkUrl || "/products"} 
                          placeholder="/products?category=winter-collection"
                          onChange={(e) => handleUpdateSlide(slide.id, "linkUrl", e.target.value)} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Text Alignment Position
                      </label>
                      <select 
                        className="input w-full max-w-xs text-xs font-bold uppercase"
                        value={slide.textPosition || "right"}
                        onChange={(e) => handleUpdateSlide(slide.id, "textPosition", e.target.value)}
                      >
                        <option value="right">Right (ع اليمين - Recommended)</option>
                        <option value="center">Center (في المنتصف)</option>
                        <option value="left">Left (ع اليسار)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: 3 FEATURED CARDS ================= */}
      {activeTab === "cards" && (
        <div className="space-y-6">
          <div className="bg-muted/40 p-4 rounded-lg border">
            <h2 className="text-base font-bold uppercase tracking-wider">3 Large Portrait Cards</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These appear below the hero section. Their height is larger than width (aspect ratio 3:4). You can configure photos, titles, and links for each collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div 
                key={card.id || idx} 
                className="bg-background border rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Card #{idx + 1} {idx === 0 ? "(Left)" : idx === 1 ? "(Center)" : "(Right)"}
                  </span>
                </div>

                {/* Portrait Image Preview */}
                <div className="space-y-2">
                  <div className="relative aspect-[3/4] bg-muted rounded-lg border overflow-hidden flex items-center justify-center">
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={getFullImageUrl(card.imageUrl)} 
                        alt={card.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center p-4 text-muted-foreground text-xs font-medium">
                        No Image Selected
                      </div>
                    )}

                    {uploadingIndex === `card-${idx}` && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                        Uploading...
                      </div>
                    )}
                  </div>

                  <label className="btn btn-outline w-full h-9 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Change Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingIndex(`card-${idx}`);
                          await handleImageUpload(file, (newUrl) => {
                            handleUpdateCard(idx, "imageUrl", newUrl);
                            setUploadingIndex(null);
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Title</label>
                    <input 
                      type="text" 
                      className="input w-full text-xs font-bold uppercase" 
                      value={card.title} 
                      onChange={(e) => handleUpdateCard(idx, "title", e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Button Text</label>
                    <input 
                      type="text" 
                      className="input w-full text-xs font-semibold uppercase" 
                      value={card.buttonText || "Shop Now"} 
                      onChange={(e) => handleUpdateCard(idx, "buttonText", e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Target Link URL</label>
                    <input 
                      type="text" 
                      className="input w-full text-xs font-mono" 
                      value={card.linkUrl} 
                      onChange={(e) => handleUpdateCard(idx, "linkUrl", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 3: WHATSAPP CONTACT ================= */}
      {activeTab === "whatsapp" && (
        <div className="max-w-2xl bg-background border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-base font-bold uppercase tracking-wider">Floating WhatsApp Button</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              The floating button appears on all customer pages at the bottom right. You can update the contact number anytime.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                WhatsApp Phone Number (with Country Code)
              </label>
              <input 
                type="text" 
                className="input w-full font-mono text-sm" 
                placeholder="+201000000000"
                value={whatsAppNumber} 
                onChange={(e) => setWhatsAppNumber(e.target.value)} 
              />
              <span className="text-[11px] text-muted-foreground block mt-1">
                Include country code without special characters (e.g. +201001234567 for Egypt).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Default Customer Greeting Message
              </label>
              <textarea 
                className="input h-20 w-full py-2 text-sm leading-relaxed" 
                value={whatsAppGreeting} 
                onChange={(e) => setWhatsAppGreeting(e.target.value)} 
              />
              <span className="text-[11px] text-muted-foreground block mt-1">
                This message pre-fills automatically when the customer clicks the WhatsApp button.
              </span>
            </div>

            {/* Test Link Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsAppGreeting)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test WhatsApp Chat Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
