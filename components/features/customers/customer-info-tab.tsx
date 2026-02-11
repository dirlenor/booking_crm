import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/lib/mock-data/customers";
import { CreditCard, MapPin, User, CalendarClock } from "lucide-react";

interface CustomerInfoTabProps {
  customer: Customer;
}

export function CustomerInfoTab({ customer }: CustomerInfoTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Full Name</div>
            <div className="col-span-2 text-sm">{customer.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Email</div>
            <div className="col-span-2 text-sm">{customer.email}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Phone</div>
            <div className="col-span-2 text-sm">{customer.phone}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Address</div>
            <div className="col-span-2 text-sm text-muted-foreground italic">No address provided</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Spending & Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Membership Tier</div>
            <div className="col-span-2 text-sm font-medium">{customer.tier}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
            <div className="col-span-2 text-sm">{customer.totalBookings} Trips</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
            <div className="col-span-2 text-sm font-medium text-green-600">
              {formatCurrency(customer.totalSpent)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Last Booking</div>
            <div className="col-span-2 text-sm flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              {customer.lastBookingDate}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Preferences & Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground italic">
            No notes added for this customer yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
