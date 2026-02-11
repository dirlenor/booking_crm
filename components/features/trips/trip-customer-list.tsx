import { TripCustomer } from "@/lib/mock-data/trips";
import { CustomerPaymentStatusBadge } from "./trip-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Users } from "lucide-react";

interface TripCustomerListProps {
  customers: TripCustomer[];
}

export function TripCustomerList({ customers }: TripCustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p>No customers booked yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead className="text-center w-[80px]">Pax</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{customer.name}</span>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">
                {customer.paxCount}
              </TableCell>
              <TableCell className="text-right">
                <CustomerPaymentStatusBadge status={customer.paymentStatus} className="text-[10px] px-1.5 py-0 h-5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
