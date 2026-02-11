import { Trip } from "@/lib/mock-data/trips";
import { TripCard } from "./trip-card";
import { cn } from "@/lib/utils";

interface TripCalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  trips: Trip[];
  onTripClick: (trip: Trip) => void;
  selectedTripId?: string;
}

export function TripCalendarDay({ date, isCurrentMonth, isToday, trips, onTripClick, selectedTripId }: TripCalendarDayProps) {
  const MAX_TRIPS_VISIBLE = 2;
  const hiddenTripsCount = trips.length > MAX_TRIPS_VISIBLE ? trips.length - MAX_TRIPS_VISIBLE : 0;
  
  return (
    <div className={cn(
      "min-h-[120px] p-2 border-b border-r flex flex-col gap-1 transition-colors relative group",
      !isCurrentMonth && "bg-muted/30 text-muted-foreground/50",
      isToday && "bg-accent/5",
      "hover:bg-muted/10"
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
          isToday ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}>
          {date.getDate()}
        </span>
        {trips.length > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {trips.length} trip{trips.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        {trips.slice(0, MAX_TRIPS_VISIBLE).map(trip => (
          <TripCard 
            key={trip.id} 
            trip={trip} 
            onClick={onTripClick}
            isSelected={selectedTripId === trip.id}
          />
        ))}
        
        {hiddenTripsCount > 0 && (
          <button 
            className="text-xs text-muted-foreground text-left px-2 py-1 hover:bg-muted rounded-sm transition-colors mt-auto font-medium"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            + {hiddenTripsCount} more
          </button>
        )}
      </div>
    </div>
  );
}
