import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Calendar, CalendarDays, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarView = 'month' | 'week' | 'day' | 'list';

interface TripCalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onCreateTrip?: () => void;
}

export function TripCalendarHeader({ 
  currentMonth, 
  onPrevMonth, 
  onNextMonth, 
  onToday,
  view,
  onViewChange,
  onCreateTrip
}: TripCalendarHeaderProps) {
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-foreground w-48">{monthName}</h2>
        <div className="flex items-center rounded-md border bg-background shadow-sm">
          <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8 rounded-r-none border-r">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday} className="h-8 rounded-none px-3 font-normal">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8 rounded-l-none border-l">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-4">
        {onCreateTrip && (
          <Button size="sm" onClick={onCreateTrip} className="gap-2 h-8">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Trip</span>
          </Button>
        )}

        <div className="flex items-center p-1 rounded-lg border bg-muted/20">
          <Button 
            variant={view === 'month' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => onViewChange('month')}
            className={cn("h-7 px-2 text-xs", view === 'month' && "bg-white shadow-sm")}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
            Month
          </Button>
          <Button 
            variant={view === 'week' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => onViewChange('week')}
            className={cn("h-7 px-2 text-xs", view === 'week' && "bg-white shadow-sm")}
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Week
          </Button>
          <Button 
            variant={view === 'day' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => onViewChange('day')}
            className={cn("h-7 px-2 text-xs", view === 'day' && "bg-white shadow-sm")}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Day
          </Button>
          <Button 
            variant={view === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => onViewChange('list')}
            className={cn("h-7 px-2 text-xs", view === 'list' && "bg-white shadow-sm")}
          >
            <List className="h-3.5 w-3.5 mr-1.5" />
            List
          </Button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span> Scheduled
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span> In Progress
          </span>
        </div>
      </div>
    </div>
  );
}
