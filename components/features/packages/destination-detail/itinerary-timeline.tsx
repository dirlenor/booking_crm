"use client";

import { CheckCircle2, Circle, Clock, MapPin, Utensils, Bus, BedDouble, Camera } from "lucide-react";
import { DestinationDetail } from "@/lib/mock-data/destination-detail";

interface ItineraryTimelineProps {
  itinerary: DestinationDetail['itinerary'];
}

export function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'transport': return <Bus className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'hotel': return <BedDouble className="w-4 h-4" />;
      case 'activity': return <Camera className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Itinerary</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {itinerary.length} Days
        </span>
      </div>

      <div className="relative pl-8 border-l-2 border-gray-100 space-y-12">
        {itinerary.map((day, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-[41px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm shadow-md ring-4 ring-white">
              {day.day}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-primary mb-2">{day.title}</h3>
            </div>

            <div className="space-y-4">
              {day.activities.map((activity, actIndex) => (
                <div key={actIndex} className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow flex gap-4">
                  <div className="flex flex-col items-center gap-1 min-w-[60px]">
                    <span className="text-sm font-semibold text-primary">{activity.time}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      {getIcon(activity.icon || 'other')}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.description}</p>
                    {activity.location && (
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {activity.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="absolute -left-[9px] bottom-0 w-4 h-4 rounded-full bg-gray-200 ring-4 ring-white" />
      </div>
    </div>
  );
}
