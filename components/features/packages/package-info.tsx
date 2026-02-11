import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourPackage } from "@/lib/mock-data/packages";
import { PackageQuotaDisplay } from "./package-quota-display";

interface PackageInfoProps {
  tourPackage: TourPackage;
}

export function PackageInfo({ tourPackage }: PackageInfoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl overflow-hidden border bg-muted h-[300px] sm:h-[400px] w-full relative">
          <img 
            src={tourPackage.imageUrl} 
            alt={tourPackage.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4">
             <span className="inline-flex items-center rounded-md bg-black/60 backdrop-blur-md px-3 py-1 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
              {tourPackage.category}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tour Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tourPackage.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(tourPackage.price)}
              </div>
              <p className="text-sm text-muted-foreground">per person</p>
            </div>

            <div className="space-y-4">
               <PackageQuotaDisplay 
                  current={tourPackage.currentPax} 
                  max={tourPackage.maxPax} 
                />
            </div>

            <div className="h-px bg-border my-4" /> 

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Departure Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tourPackage.departureDate).toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{tourPackage.duration}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Destination</p>
                  <p className="text-sm text-muted-foreground">{tourPackage.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{tourPackage.category}</p>
                </div>
              </div>
            </div>
            
            <Button disabled className="w-full mt-4">
              Book This Tour (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
