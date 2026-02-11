"use client";

import { ArrowLeft, MapPin, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DestinationDetail } from "@/lib/mock-data/destination-detail";

interface DestinationHeroProps {
  data: DestinationDetail;
}

export function DestinationHero({ data }: DestinationHeroProps) {
  const coverImage = data.images.find((img) => img.isCover) || data.images[0];

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden rounded-b-3xl shadow-lg">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${coverImage.url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
        <Link href="/packages">
          <Button variant="outline" size="icon" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 max-w-7xl mx-auto w-full z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-accent text-accent-foreground border-none px-3 py-1">
                {data.status === 'published' ? 'Bestseller' : 'Draft'}
              </Badge>
              <div className="flex items-center text-white/90 text-sm font-medium">
                <MapPin className="w-4 h-4 mr-1 text-accent" />
                {data.location}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              {data.title}
            </h1>
            
            <p className="text-lg text-white/80 line-clamp-2 max-w-xl">
              {data.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-white">
            <span className="text-sm font-medium opacity-80">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">฿{data.startPrice.toLocaleString()}</span>
              <span className="text-sm opacity-80">/ person</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
