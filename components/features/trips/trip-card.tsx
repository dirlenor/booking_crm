import { Trip } from "@/lib/mock-data/trips";
import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
  isSelected?: boolean;
}

export function TripCard({ trip, onClick, isSelected }: TripCardProps) {
  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'scheduled': return "border-l-blue-500 bg-blue-50/50 hover:bg-blue-100/50";
      case 'completed': return "border-l-green-500 bg-green-50/50 hover:bg-green-100/50";
      case 'in-progress': return "border-l-amber-500 bg-amber-50/50 hover:bg-amber-100/50";
      case 'cancelled': return "border-l-red-500 bg-red-50/50 hover:bg-red-100/50";
      default: return "border-l-gray-500";
    }
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick(trip);
      }}
      className={cn(
        "group relative p-2 rounded-md border text-left transition-all cursor-pointer shadow-sm hover:shadow-md",
        "border-l-[3px]", 
        getStatusColor(trip.status),
        isSelected ? "ring-2 ring-primary ring-offset-1" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs font-semibold text-foreground line-clamp-1">
          {trip.packageName}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{trip.time}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-full bg-background/50",
          trip.participants >= trip.maxParticipants ? "text-red-600" : "text-foreground"
        )}>
          <Users className="h-3 w-3" />
          <span>{trip.participants}/{trip.maxParticipants}</span>
        </div>
      </div>
    </div>
  );
}
