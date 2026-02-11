import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/mock-data/bookings";
import { PaymentStatusBadge } from "./booking-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BookingPaymentTabProps {
  booking: Booking;
}

export function BookingPaymentTab({ booking }: BookingPaymentTabProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(dateString));
  };

  const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = booking.totalAmount - totalPaid;
  const progress = Math.min(100, Math.max(0, (totalPaid / booking.totalAmount) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment History
            </CardTitle>
            <Button size="sm" variant="outline">Record Payment</Button>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  booking.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {formatDate(payment.date)}
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ฿{payment.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <div className="flex flex-col gap-1 pb-4 border-b">
               <span className="text-sm text-muted-foreground">Total Amount</span>
               <span className="text-3xl font-bold">฿{booking.totalAmount.toLocaleString()}</span>
             </div>
             
             <div className="flex flex-col gap-3">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Paid</span>
                 <span className="font-medium text-green-600">฿{totalPaid.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Remaining</span>
                 <span className="font-medium text-red-600">฿{remaining.toLocaleString()}</span>
               </div>
             </div>
             
             <div className="flex flex-col gap-2 pt-2">
               <div className="flex justify-between text-xs text-muted-foreground mb-1">
                 <span>Progress</span>
                 <span>{Math.round(progress)}%</span>
               </div>
               <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                 <div 
                   className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'} transition-all duration-500`} 
                   style={{ width: `${progress}%` }} 
                 />
               </div>
             </div>
             
             <div className="pt-2">
               <PaymentStatusBadge status={booking.paymentStatus} className="w-full justify-center py-1" />
             </div>
          </CardContent>
          {remaining > 0 && (
            <CardFooter className="bg-amber-50/50 border-t border-amber-100 p-4">
               <div className="flex items-start gap-2 text-amber-800 text-xs">
                 <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                 <p>Payment is pending. Please collect remaining balance before trip date.</p>
               </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
