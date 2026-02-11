"use client";

import { Button } from "@/components/ui/button";
import { DestinationDetail } from "@/lib/mock-data/destination-detail";

interface BookingCTAProps {
  price: number;
}

export function BookingCTA({ price }: BookingCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40 md:pl-64">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="hidden md:block">
          <p className="text-sm text-gray-500 font-medium">Starting from</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">฿{price.toLocaleString()}</span>
            <span className="text-sm text-gray-400">/ person</span>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto w-full md:w-auto">
          <div className="md:hidden">
             <span className="block text-xs text-gray-500">From</span>
             <span className="font-bold text-primary">฿{price.toLocaleString()}</span>
          </div>
          <Button size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-white font-bold rounded-xl h-12 px-8 shadow-lg shadow-accent/20">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
