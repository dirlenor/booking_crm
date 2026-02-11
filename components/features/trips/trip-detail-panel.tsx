import { Trip } from "@/lib/mock-data/trips";
import { TripStatusBadge } from "./trip-status-badge";
import { TripCustomerList } from "./trip-customer-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Calendar, Clock, MapPin, User, Users, FileText, ExternalLink, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripDetailPanelProps {
  trip: Trip | null;
  onClose: () => void;
  onEdit?: () => void;
  className?: string;
}

export function TripDetailPanel({ trip, onClose, onEdit, className }: TripDetailPanelProps) {
  if (!trip) {
    return (
      <div className={cn("hidden lg:flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground border-l bg-muted/10", className)}>
        <Calendar className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium">No Trip Selected</h3>
        <p className="text-sm max-w-[200px]">Select a trip from the calendar to view details and participants.</p>
      </div>
    );
  }

  const occupancyRate = (trip.participants / trip.maxParticipants) * 100;
  
  return (
    <div className={cn("flex flex-col h-full border-l bg-background shadow-xl lg:shadow-none z-20", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg line-clamp-1">{trip.packageName}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{trip.id}</span>
            <TripStatusBadge status={trip.status} className="h-5 text-[10px] px-1.5" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 shrink-0" title="Edit Trip">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0" title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Date
            </span>
            <span className="text-sm font-medium">{trip.date}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Time
            </span>
            <span className="text-sm font-medium">{trip.time} ({trip.duration})</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Destination
            </span>
            <span className="text-sm font-medium">{trip.destination}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Guide
            </span>
            <span className="text-sm font-medium">{trip.guide}</span>
          </div>
        </div>

        {/* Quota Section */}
        <Card className="bg-muted/30 border-none shadow-none">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Occupancy</span>
              </div>
              <span className="text-sm font-bold">
                {trip.participants} / {trip.maxParticipants} <span className="text-muted-foreground font-normal text-xs">pax</span>
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  occupancyRate >= 100 ? "bg-red-500" :
                  occupancyRate >= 80 ? "bg-amber-500" :
                  "bg-primary"
                )}
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.max(0, trip.maxParticipants - trip.participants)} seats available</span>
              <span>{Math.round(occupancyRate)}% full</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manifest ({trip.customers.length})
            </h3>
          </div>
          <TripCustomerList customers={trip.customers} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-muted/10 space-y-2">
        <Button className="w-full gap-2" variant="outline">
          <FileText className="h-4 w-4" />
          Print Manifest
        </Button>
        <Button className="w-full gap-2" variant="default">
          <ExternalLink className="h-4 w-4" />
          View Full Details
        </Button>
      </div>
    </div>
  );
}
