import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PackageSearch() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search packages by name, destination..."
          className="pl-8 w-full"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2 shrink-0">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" className="shrink-0 hidden sm:flex">
          Sort by
        </Button>
      </div>
    </div>
  );
}
