import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingPassenger } from "@/lib/mock-data/bookings";
import { User, Calendar, MapPin, CheckCircle2, Clock } from "lucide-react";
import type { Customer } from "@/lib/mock-data/customers";
import type { TourPackage } from "@/lib/mock-data/packages";
import { resolveOptionPricing } from "@/lib/pricing";

interface BookingStepSummaryProps {
  data: {
    customerId?: string;
    packageId?: string;
    tripDate?: string;
    tripTime?: string;
    pax?: number;
    passengers?: BookingPassenger[];
  };
  customer?: Customer | null;
  tourPackage?: TourPackage | null;
}

export function BookingStepSummary({ data, customer, tourPackage }: BookingStepSummaryProps) {
  const pricing = resolveOptionPricing(
    tourPackage?.options?.[0],
    data.pax ?? 1,
    tourPackage?.price ?? 0
  );
  const totalPrice = pricing.total;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(dateString));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Please review all details before confirming the booking.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-3 bg-muted/30">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
               {customer?.avatarInitials}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{customer?.name}</span>
              <span className="text-sm text-muted-foreground">{customer?.email}</span>
              <span className="text-sm text-muted-foreground">{customer?.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 bg-muted/30">
             <CardTitle className="text-sm font-medium">Package & Trip</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
               <span className="font-semibold">{tourPackage?.name}</span>
             <div className="grid grid-cols-2 gap-2 text-sm">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Calendar className="h-4 w-4" />
                  <span>{formatDate(data.tripDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{data.tripTime || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                   <span>{tourPackage?.destination}</span>
                </div>
               <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                 <User className="h-4 w-4" />
                 <span>{data.pax} Passengers</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-3 bg-muted/30">
          <CardTitle className="text-sm font-medium">Passengers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y">
             {data.passengers?.map((pax, index) => (
               <div key={index} className="flex items-center justify-between p-4 text-sm">
                 <div className="flex items-center gap-3">
                   <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                   <span className="font-medium">{pax.name || '(No Name)'}</span>
                 </div>
                 <div className="flex gap-4 text-muted-foreground">
                   <span>{pax.type}</span>
                   {pax.age && <span>{pax.age} yrs</span>}
                 </div>
               </div>
             ))}
           </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-3xl font-bold text-primary">฿{totalPrice.toLocaleString()}</span>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {pricing.isFlatRate
                ? `${pricing.unitPrice.toLocaleString()} flat rate`
                : `${pricing.unitPrice.toLocaleString()} x ${data.pax} Pax`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
