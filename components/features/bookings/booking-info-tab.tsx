import { Calendar, User, Users, MapPin, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@/lib/mock-data/bookings";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BookingInfoTabProps {
  booking: Booking;
}

export function BookingInfoTab({ booking }: BookingInfoTabProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(dateString));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info - Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col gap-1">
               <h3 className="font-semibold text-lg">{booking.package?.name}</h3>
               <p className="text-muted-foreground text-sm">{booking.package?.description}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Trip Date</span>
                  <span className="font-medium">{formatDate(booking.tripDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total Pax</span>
                  <span className="font-medium">{booking.pax} Passengers</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Destination</span>
                  <span className="font-medium">{booking.package?.destination}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="font-medium">{booking.package?.duration}</span>
                </div>
              </div>
            </div>
            
            {booking.notes && (
               <div className="flex flex-col gap-2 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-900">
                 <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Special Requests / Notes</span>
                 <p className="text-sm">{booking.notes}</p>
               </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Passenger List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Passport/ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.passengers.map((pax) => (
                  <TableRow key={pax.id}>
                    <TableCell className="font-medium">{pax.name}</TableCell>
                    <TableCell>{pax.type}</TableCell>
                    <TableCell>{pax.age || '-'}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{pax.passportNumber || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Right Column */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {booking.customer?.avatarInitials}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{booking.customer?.name}</span>
                  <span className="text-sm text-muted-foreground">{booking.customer?.tier} Member</span>
                </div>
             </div>
             <div className="grid gap-3 pt-2 border-t mt-2">
               <div className="flex flex-col gap-0.5">
                 <span className="text-xs text-muted-foreground">Email</span>
                 <span className="text-sm font-medium">{booking.customer?.email}</span>
               </div>
               <div className="flex flex-col gap-0.5">
                 <span className="text-xs text-muted-foreground">Phone</span>
                 <span className="text-sm font-medium">{booking.customer?.phone}</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
