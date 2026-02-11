"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Trip {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: string;
  max_participants: number;
  guide_name?: string | null;
}

interface TripScheduleEditorProps {
  packageId: string;
  onDatesChange?: (dates: string[]) => void;
}

export function TripScheduleEditor({ packageId, onDatesChange }: TripScheduleEditorProps) {
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  
  // Data State
  const [existingTrips, setExistingTrips] = useState<Trip[]>([]);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [packageId]);

  useEffect(() => {
    onDatesChange?.(Array.from(selectedDates));
  }, [selectedDates, onDatesChange]);

  const fetchTrips = async () => {
    setFetching(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("trips")
      .select("id, date, time, status, max_participants, guide_name")
      .eq("package_id", packageId)
      .order("date", { ascending: true });
    
    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setExistingTrips(data);
    }
    setFetching(false);
  };

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, month]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const existingDates = useMemo(() => {
    return new Set(existingTrips.map(t => t.date));
  }, [existingTrips]);

  const toggleDate = (dateStr: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
    setErrorMsg(null);
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            {monthName} {year}
          </div>
          <div className="text-sm text-muted-foreground">
            {fetching ? "Loading trips..." : `${existingTrips.length} scheduled`}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} type="button">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} type="button">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-muted-foreground font-medium py-2">{d}</div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12" />
          ))}

          {daysInMonth.map((date) => {
            const dateStr = formatDate(date);
            const isExisting = existingDates.has(dateStr);
            const isSelected = selectedDates.has(dateStr);
            const disabled = isPast(date) || isExisting;
            const currentIsToday = isToday(date);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => toggleDate(dateStr)}
                className={cn(
                  "h-10 sm:h-12 rounded-md flex items-center justify-center text-sm transition-all relative border border-transparent",
                  "hover:border-primary/20",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 hover:border-transparent shadow-sm scale-105 z-10",
                  isExisting && "bg-muted text-muted-foreground cursor-not-allowed bg-slate-100",
                  disabled && !isExisting && "text-muted-foreground/30 cursor-not-allowed",
                  currentIsToday && !isSelected && "text-primary font-bold ring-1 ring-primary/20 bg-primary/5",
                  !disabled && !isSelected && "bg-background border-input/40 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {date.getDate()}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white text-primary rounded-full flex items-center justify-center ring-2 ring-primary text-[8px]">
                    <Check className="w-2 h-2" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-100 border border-transparent" />
            <span>Existing Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/5 ring-1 ring-primary/20" />
            <span>Today</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-5 bg-muted/20 rounded-xl border h-fit">
        <div>
          <h3 className="font-semibold mb-1">Trip Dates</h3>
          <p className="text-sm text-muted-foreground">
            {selectedDates.size === 0 
              ? "เลือกวันที่ในแท็บนี้ แล้วระบบจะซิงก์เวลาจาก Options ตอนกด Save Changes"
              : `Selected ${selectedDates.size} date${selectedDates.size === 1 ? '' : 's'}`
            }
          </p>
        </div>

        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          เวลาทริปถูกกำหนดจาก <span className="font-medium text-foreground">Options &gt; Time Slots</span> เท่านั้น
        </div>

        <div className="text-sm text-muted-foreground">
          {selectedDates.size > 0
            ? "เมื่อกด Save Changes ระบบจะสร้าง/ซิงก์ trips ตาม วันที่ที่เลือก x เวลาในแต่ละ option"
            : "ยังไม่ได้เลือกวันที่"}
        </div>

        {errorMsg && (
          <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20">
            {errorMsg}
          </div>
        )}

        <div className="rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-sm font-semibold">Existing Trips</div>
            <div className="text-xs text-muted-foreground">{existingTrips.length}</div>
          </div>
          {fetching ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : existingTrips.length === 0 ? (
            <div className="text-sm text-muted-foreground">No trips yet.</div>
          ) : (
            <div className="max-h-56 overflow-auto">
              {existingTrips.slice(0, 12).map((trip) => (
                <div key={trip.id} className="py-2 border-b last:border-b-0">
                  <div className="text-sm font-medium text-foreground">
                    {trip.date} - {trip.time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trip.status} - max {trip.max_participants} - guide {trip.guide_name ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-auto">
          <Link 
            href={`/trips?package_id=${packageId}`}
            className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
          >
            Manage all trips in Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
