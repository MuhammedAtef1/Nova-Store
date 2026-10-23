"use client";

import { useState } from "react";
import { getImageUrl } from '@/lib/api';
import { ProductImage } from "@/types/catalog";

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.5)' });
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center text-muted-foreground">
        No Images Available
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4">
      {/* Main Image */}
      <div className="flex-1 aspect-[3/4] bg-muted relative overflow-hidden cursor-crosshair" onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setZoomStyle({ transform: "scale(1)", transformOrigin: "center center" }); }}>
        <img 
          src={getImageUrl(images[activeIndex].url)} 
          alt={images[activeIndex].altText || productName} 
          className={`w-full h-full object-cover transition-transform ${isHovered ? "duration-75" : "duration-300"}`} style={zoomStyle}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 shrink-0 pb-2 md:pb-0">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[3/4] w-20 md:w-full shrink-0 border-2 transition-all overflow-hidden ${
                activeIndex === idx ? 'border-vini-black' : 'border-transparent hover:border-border'
              }`}
            >
              <img 
                src={getImageUrl(img.url)} 
                alt={`Thumbnail ${idx + 1}`} 
                className={`w-full h-full object-cover transition-transform ${isHovered ? "duration-75" : "duration-300"}`} style={zoomStyle}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

