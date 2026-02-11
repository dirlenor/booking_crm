import { Calendar as CalendarIcon, Users, MapPin, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { TourPackage } from "@/lib/mock-data/packages";
import { supabase } from "@/lib/supabase/client";

interface TripSlot {
  id: string;
  date: string;
  time: string;
  max_participants: number | null;
}

interface BookingStepPackageProps {
  onSelect: (data: { packageId: string; tripDate: string; tripId: string; tripTime: string; pax: number }) => void;
  data: { packageId?: string; tripDate?: string; tripId?: string; tripTime?: string; pax?: number };
  packages: TourPackage[];
}

export function BookingStepPackage({ onSelect, data, packages }: BookingStepPackageProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(data.packageId);
  const [tripDate, setTripDate] = useState<string>(data.tripDate || "");
  const [tripId, setTripId] = useState<string>(data.tripId || "");
  const [tripTime, setTripTime] = useState<string>(data.tripTime || "");
  const [pax, setPax] = useState<number>(data.pax || 2);
  const [trips, setTrips] = useState<TripSlot[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    const loadTrips = async () => {
      if (!selectedPackageId) {
        setTrips([]);
        return;
      }

      setLoadingTrips(true);
      const { data: rows } = await supabase
        .from("trips")
        .select("id, date, time, max_participants")
        .eq("package_id", selectedPackageId)
        .eq("status", "scheduled")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      setTrips((rows ?? []) as TripSlot[]);
      setLoadingTrips(false);
    };

    loadTrips();
  }, [selectedPackageId]);

  const availableDates = useMemo(() => {
    return Array.from(new Set(trips.map((trip) => trip.date))).sort();
  }, [trips]);

  const timeSlotsForDate = useMemo(() => {
    if (!tripDate) return [];
    return trips.filter((trip) => trip.date === tripDate);
  }, [tripDate, trips]);

  const handlePackageSelect = (id: string) => {
    setSelectedPackageId(id);
    setTripDate("");
    setTripId("");
    setTripTime("");
  };

  const handleDateChange = (date: string) => {
    setTripDate(date);
    setTripId("");
    setTripTime("");
  };

  const handleTimeSlotSelect = (slot: TripSlot) => {
    if (!selectedPackageId || !tripDate) return;
    const nextTripTime = (slot.time ?? "").slice(0, 5);
    setTripId(slot.id);
    setTripTime(nextTripTime);
    onSelect({
      packageId: selectedPackageId,
      tripDate,
      tripId: slot.id,
      tripTime: nextTripTime,
      pax,
    });
  };

  const handlePaxChange = (val: number) => {
    setPax(val);
    if (selectedPackageId && tripDate && tripId && tripTime) {
      onSelect({
        packageId: selectedPackageId,
        tripDate,
        tripId,
        tripTime,
        pax: val,
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">1. Select Tour Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {packages.filter(p => p.status === 'published').map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <Card 
                key={pkg.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50 relative p-0 overflow-hidden flex flex-col h-full",
                  isSelected ? "border-primary ring-1 ring-primary" : "border-border"
                )}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                  <div className="h-32 w-full bg-muted relative">
                    <img
                      src={pkg.imageUrl} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                 </div>
                 <div className="p-4 flex flex-col gap-2 flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm line-clamp-2">{pkg.name}</h4>
                      <span className="text-sm font-bold text-primary shrink-0">฿{pkg.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                       <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {pkg.destination}</span>
                       <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {pkg.duration}</span>
                    </div>
                 </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Trip Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date" 
              className="pl-9"
              value={tripDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={availableDates[0]}
              disabled={!selectedPackageId || trips.length === 0}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {loadingTrips
              ? "Loading trip dates..."
              : !selectedPackageId
                ? "Select package first"
                : availableDates.length === 0
                  ? "No scheduled trips available"
                  : `${availableDates.length} available date(s)`}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Number of Passengers</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="number" 
              min={1}
              max={50}
              className="pl-9"
              value={pax}
              onChange={(e) => handlePaxChange(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium leading-none">Trip Time</label>
        {!tripDate ? (
          <div className="text-sm text-muted-foreground rounded-lg border border-dashed px-3 py-2">
            Select trip date to view available time slots.
          </div>
        ) : timeSlotsForDate.length === 0 ? (
          <div className="text-sm text-muted-foreground rounded-lg border border-dashed px-3 py-2">
            No time slots for selected date.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {timeSlotsForDate.map((slot) => {
              const slotTime = (slot.time ?? "").slice(0, 5);
              const isActive = tripId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  )}
                >
                  {slotTime}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
