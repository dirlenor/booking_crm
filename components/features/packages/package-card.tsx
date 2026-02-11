import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TourPackage } from "@/lib/mock-data/packages";
import { PackageQuotaDisplay } from "./package-quota-display";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  tourPackage: TourPackage;
}

export function PackageCard({ tourPackage }: PackageCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200";
      case 'draft':
        return "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200";
      case 'archived':
        return "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-36 w-full bg-muted">
        <img
          src={tourPackage.imageUrl} 
          alt={tourPackage.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className={cn("font-normal capitalize shadow-sm", getStatusColor(tourPackage.status))}>
            {tourPackage.status}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground shadow-sm backdrop-blur-sm">
            {tourPackage.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">
            {tourPackage.name}
          </h3>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-1 mt-0">
          <MapPin className="h-3.5 w-3.5" />
          <span>{tourPackage.destination}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-1">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{tourPackage.duration}</span>
            </div>
            <div className="font-semibold text-primary text-lg">
              {formatCurrency(tourPackage.price)}
            </div>
          </div>
          
          <PackageQuotaDisplay 
            current={tourPackage.currentPax} 
            max={tourPackage.maxPax} 
          />
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            <Users className="h-3.5 w-3.5" />
            <span>Next departure: {new Date(tourPackage.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-1">
        <Link href={`/packages/${tourPackage.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
