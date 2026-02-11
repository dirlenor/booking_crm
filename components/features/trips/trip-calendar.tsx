"use client";

import { useEffect, useMemo, useState } from "react";
import { Trip } from "@/lib/mock-data/trips";
import type { TourPackage } from "@/lib/mock-data/packages";
import { supabase } from "@/lib/supabase/client";
import { TripCalendarHeader, CalendarView } from "./trip-calendar-header";
import { TripCalendarDay } from "./trip-calendar-day";
import { TripDetailPanel } from "./trip-detail-panel";
import { TripStatusBadge } from "./trip-status-badge";
import { TripFormModal } from "./trip-form-modal";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, MapPin, Package, Clock } from "lucide-react";

export function TripCalendar({ packageId }: { packageId?: string }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 15));
  const [view, setView] = useState<CalendarView>('month');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [tripData, setTripData] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedTrip = useMemo(() => 
    tripData.find(t => t.id === selectedTripId) || null
  , [selectedTripId, tripData]);

  const loadTrips = async () => {
    setLoading(true);
    setError(null);

    let tripsQuery = supabase
      .from("trips")
      .select(
        "id, package_id, date, time, max_participants, guide_name, status, package:packages(id, name, description, destination, duration, base_price, max_pax, status, category, highlights, image_url)"
      );

    if (packageId) {
      tripsQuery = tripsQuery.eq("package_id", packageId);
    }

    const [{ data: tripRows, error: tripError }, { data: bookingRows }] = await Promise.all([
      tripsQuery,
      supabase
        .from("bookings")
        .select("id, trip_id, pax, payment_status, customer:customers(id, name, email, phone)")
    ]);

    if (tripError) {
      setError(tripError.message);
      setLoading(false);
      return;
    }

    const bookingsByTrip = new Map<string, typeof bookingRows>();
    bookingRows?.forEach((booking) => {
      if (!booking.trip_id) return;
      const list = bookingsByTrip.get(booking.trip_id) ?? [];
      list.push(booking);
      bookingsByTrip.set(booking.trip_id, list);
    });

    const mapped: Trip[] =
      tripRows?.map((trip) => {
        const pkg = Array.isArray(trip.package) ? trip.package[0] : trip.package;
        const bookingList = bookingsByTrip.get(trip.id) ?? [];
        const participants = bookingList.reduce((sum, b) => sum + (b.pax ?? 0), 0);
        const customers = bookingList.map((booking) => {
          const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;
          return {
            id: customer?.id ?? booking.id,
            name: customer?.name ?? "-",
            email: customer?.email ?? "-",
            phone: customer?.phone ?? "-",
            paxCount: booking.pax ?? 0,
            paymentStatus: booking.payment_status,
            bookingId: booking.id,
          };
        });

        const durationLabel = pkg?.duration ?? "-";
        const dayMatch = durationLabel.match(/(\d+)\s*Day/i);
        const nightMatch = durationLabel.match(/(\d+)\s*Night/i);
        const days = dayMatch ? Number(dayMatch[1]) : 0;
        const nights = nightMatch ? Number(nightMatch[1]) : 0;

        const packageDetail: TourPackage = {
          id: pkg?.id ?? "",
          name: pkg?.name ?? "-",
          description: pkg?.description ?? "",
          destination: pkg?.destination ?? "-",
          duration: durationLabel,
          days,
          nights,
          price: Number(pkg?.base_price ?? 0),
          maxPax: pkg?.max_pax ?? 0,
          currentPax: participants,
          departureDate: trip.date,
          status: pkg?.status ?? "draft",
          category: pkg?.category ?? "Cultural",
          highlights: pkg?.highlights ?? [],
          imageUrl: pkg?.image_url ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
          options: [],
        };

        return {
          id: trip.id,
          packageId: trip.package_id,
          packageName: pkg?.name ?? "-",
          destination: pkg?.destination ?? "-",
          date: trip.date,
          time: trip.time ?? "-",
          duration: pkg?.duration ?? "-",
          participants,
          maxParticipants: trip.max_participants ?? pkg?.max_pax ?? 0,
          guide: trip.guide_name ?? "-",
          status: trip.status,
          customers,
          package: packageDetail,
        };
      }) ?? [];

    setTripData(mapped);
    setSelectedTripId((current) => (current && mapped.some((t) => t.id === current) ? current : null));
    setLoading(false);
  };

  useEffect(() => {
    loadTrips();
  }, [packageId]);

  const calendarDays = useMemo(() => {
    if (view !== 'month') return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    
    const days: Date[] = [];
    
    for (let i = startDayOfWeek; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }, [currentDate, view]);

  const tripsByDate = useMemo(() => {
    const map: Record<string, Trip[]> = {};
    tripData.forEach(trip => {
      if (!map[trip.date]) map[trip.date] = [];
      map[trip.date].push(trip);
    });
    return map;
  }, [tripData]);

  const filteredTrips = useMemo(() => {
    if (view === 'month') return [];

    let start: Date, end: Date;

    const getStartOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const newDate = new Date(date.setDate(diff));
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };

    if (view === 'week') {
      start = getStartOfWeek(currentDate);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'day') {
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    return tripData.filter(trip => {
      const tripDate = new Date(trip.date + 'T' + trip.time);
      return tripDate >= start && tripDate <= end;
    }).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  }, [currentDate, view, tripData]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month' || view === 'list') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month' || view === 'list') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
      <TripCalendarHeader 
        currentMonth={currentDate}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        onToday={handleToday}
        view={view}
        onViewChange={setView}
        onCreateTrip={() => setIsCreateModalOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden border rounded-lg shadow-sm bg-background">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {loading && (
            <div className="p-6 text-sm text-muted-foreground">Loading trips...</div>
          )}
          {error && (
            <div className="p-6 text-sm text-destructive">{error}</div>
          )}
          
          {!loading && !error && view === 'month' ? (
            <>
              <div className="grid grid-cols-7 border-b bg-muted/40 text-center py-2 text-sm font-semibold text-muted-foreground sticky top-0 z-10">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
              
              <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {calendarDays.map((date, index) => {
                  const dateKey = formatDate(date);
                  const dayTrips = tripsByDate[dateKey] || [];
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(date, new Date());

                  return (
                    <TripCalendarDay 
                      key={index}
                      date={date}
                      isCurrentMonth={isCurrentMonth}
                      isToday={isToday}
                      trips={dayTrips}
                      onTripClick={(trip) => setSelectedTripId(trip.id)}
                      selectedTripId={selectedTripId || undefined}
                    />
                  );
                })}
              </div>
            </>
          ) : !loading && !error ? (
            <div className="p-0">
              {filteredTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Package className="h-10 w-10 mb-2 opacity-20" />
                  <p>No trips found for this period</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Pax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow 
                        key={trip.id} 
                        className={cn("cursor-pointer", selectedTripId === trip.id && "bg-muted/50")}
                        onClick={() => setSelectedTripId(trip.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {trip.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium max-w-[200px] truncate" title={trip.packageName}>
                            {trip.packageName}
                          </div>
                          <div className="text-xs text-muted-foreground">{trip.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {trip.destination}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TripStatusBadge status={trip.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(
                              trip.participants >= trip.maxParticipants ? "text-amber-600 font-medium" : ""
                            )}>
                              {trip.participants}/{trip.maxParticipants}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : null}
        </div>
        
        <TripDetailPanel 
          trip={selectedTrip}
          onClose={() => setSelectedTripId(null)}
          onEdit={() => setIsEditModalOpen(true)}
          className={cn(
            "w-[350px] shrink-0 transition-all duration-300 ease-in-out border-l",
            selectedTripId ? "translate-x-0" : "w-0 overflow-hidden opacity-0 border-none"
          )}
        />
      </div>

      <TripFormModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadTrips}
      />

      <TripFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={selectedTrip}
        onSuccess={loadTrips}
      />
    </div>
  );
}
