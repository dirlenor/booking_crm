import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BookingSearch() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search bookings..." 
          className="pl-9 bg-white"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Filter className="h-4 w-4" />
          Status
        </Button>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Filter className="h-4 w-4" />
          Payment
        </Button>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
      </div>
    </div>
  );
}
