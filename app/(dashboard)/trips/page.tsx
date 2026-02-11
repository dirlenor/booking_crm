import { TripCalendar } from "@/components/features/trips/trip-calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { use } from "react";

interface TripsPageProps {
  searchParams?: Promise<{ package_id?: string }>;
}

export default function TripsPage({ searchParams }: TripsPageProps) {
  const params = searchParams ? use(searchParams) : undefined;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Trip Calendar
          </h1>
          <p className="text-muted-foreground">Manage tour departures and view daily manifests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Schedule
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <TripCalendar packageId={params?.package_id} />
      </div>
    </div>
  );
}
