import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Payment } from "@/lib/mock-data/payments";
import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import Link from "next/link";

interface PaymentRowProps {
  payment: Payment;
}

export function PaymentRow({ payment }: PaymentRowProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{formatDate(payment.date)}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {payment.id}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <Link 
          href={`/bookings/${payment.bookingId}`}
          className="hover:underline hover:text-primary transition-colors font-medium text-sm"
        >
          {payment.bookingRef}
        </Link>
      </TableCell>
      
      <TableCell>
        <span className="text-sm font-medium">{payment.customerName}</span>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <span className="text-sm text-muted-foreground line-clamp-1" title={payment.packageName}>
          {payment.packageName}
        </span>
      </TableCell>
      
      <TableCell className="hidden sm:table-cell">
        <PaymentMethodBadge method={payment.method} />
      </TableCell>
      
      <TableCell className="text-right font-medium">
        ฿{payment.amount.toLocaleString()}
      </TableCell>
      
      <TableCell>
        <PaymentStatusBadge status={payment.status} />
      </TableCell>
      
      <TableCell>
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/bookings/${payment.bookingId}?tab=payments`}>
              <span className="sr-only">View Details</span>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
