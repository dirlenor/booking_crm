"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Customer } from "@/lib/mock-data/customers";
import { CustomerAvatar } from "./customer-avatar";
import { cn } from "@/lib/utils";

interface CustomerRowProps {
  customer: Customer;
  onDelete: (customerId: string) => void;
  canDelete?: boolean;
}

export function CustomerRow({ customer, onDelete, canDelete = true }: CustomerRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200";
      case 'inactive':
        return "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-purple-200";
      case 'VIP':
        return "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200";
      case 'Standard':
        return "bg-blue-50 text-blue-700 hover:bg-blue-50/80 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <CustomerAvatar initials={customer.avatarInitials} />
          <div className="flex flex-col">
            <Link href={`/customers/${customer.id}`} className="font-semibold text-foreground hover:underline">
              {customer.name}
            </Link>
            <span className="text-xs text-muted-foreground sm:hidden">{customer.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-muted-foreground">{customer.email}</TableCell>
      <TableCell className="hidden lg:table-cell text-muted-foreground">{customer.phone}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("font-normal capitalize", getStatusColor(customer.status))}>
          {customer.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("font-normal", getTierColor(customer.tier))}>
          {customer.tier}
        </Badge>
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        {formatCurrency(customer.totalSpent)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/customers/${customer.id}`} aria-label="Edit customer">
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          {canDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(customer.id)}
              aria-label="Delete customer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
