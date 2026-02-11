"use client";

import Image from "next/image";
import { DestinationDetail } from "@/lib/mock-data/destination-detail";

interface GalleryGridProps {
  images: DestinationDetail['images'];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  // Exclude the cover image or just show first 5 (1 large, 4 small)
  // Let's assume we show the first 5 images in a bento grid
  const displayImages = images.slice(0, 5);

  if (displayImages.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Gallery</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
        {/* Main large image */}
        <div className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden shadow-sm group">
           <div 
             className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
             style={{ backgroundImage: `url(${displayImages[0].url})` }}
           />
           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
             <p className="text-white font-medium">{displayImages[0].caption}</p>
           </div>
        </div>

        {/* Smaller images */}
        {displayImages.slice(1).map((img, idx) => (
          <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${img.url})` }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm truncate">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
