"use client";

import { Clock, Users, Star, Trophy, MessageCircle } from "lucide-react";
import { DestinationDetail } from "@/lib/mock-data/destination-detail";

interface StatsBarProps {
  stats: DestinationDetail['stats'];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 -mt-8 relative z-20">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
        
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Duration</span>
          </div>
          <p className="text-lg font-bold text-primary">{stats.duration}</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-2 border-l border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Group Size</span>
          </div>
          <p className="text-lg font-bold text-primary">{stats.minPax} - {stats.maxPax} Pax</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-2 border-l border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Difficulty</span>
          </div>
          <p className="text-lg font-bold text-primary">{stats.difficulty}</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-2 border-l border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{stats.rating}</span>
            <div className="flex items-center text-xs text-gray-400">
              <MessageCircle className="w-3 h-3 mr-1" />
              ({stats.reviewCount})
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
