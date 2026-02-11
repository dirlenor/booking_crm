import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookingHistory } from "@/lib/mock-data/customers";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerBookingsTabProps {
  bookings: BookingHistory[];
}

export function CustomerBookingsTab({ bookings }: CustomerBookingsTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: BookingHistory['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusClass = (status: BookingHistory['status']) => {
     if (status === 'pending') return "bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-amber-200";
     return "";
  };

  const getPaymentStatusVariant = (status: BookingHistory['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'outline';
      case 'unpaid':
        return 'destructive';
      case 'partial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusClass = (status: BookingHistory['paymentStatus']) => {
      if (status === 'paid') return "text-green-600 border-green-200 bg-green-50";
      return "";
  };

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No bookings found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            This customer hasn't made any bookings yet. Create a new booking to get started.
          </p>
          <Button>Create Booking</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Booking History</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input placeholder="Search bookings..." className="h-8 w-[150px] lg:w-[250px]" />
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Ref</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Trip Date</TableHead>
              <TableHead className="text-center">Pax</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.bookingRef}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={booking.packageName}>
                  {booking.packageName}
                </TableCell>
                <TableCell>{formatDate(booking.tripDate)}</TableCell>
                <TableCell className="text-center">{booking.pax}</TableCell>
                <TableCell className="text-right">{formatCurrency(booking.amount)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(booking.status)}
                    className={getStatusClass(booking.status)}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                   <Badge 
                    variant={getPaymentStatusVariant(booking.paymentStatus)}
                    className={getPaymentStatusClass(booking.paymentStatus)}
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
