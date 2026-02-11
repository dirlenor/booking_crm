"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerAvatar } from "@/components/features/customers/customer-avatar";
import { Customer } from "@/lib/mock-data/customers";
import { CustomerFormModal } from "./customer-form-modal";

interface CustomerProfileHeaderProps {
  customer: Customer;
}

export function CustomerProfileHeader({ customer }: CustomerProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/customers">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex flex-row gap-4 items-center">
          <CustomerAvatar initials={customer.avatarInitials} size="lg" className="h-20 w-20 text-xl" />
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{customer.name}</h1>
              <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                {customer.status}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                  {customer.tier} Member
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {customer.phone}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button className="flex-1 md:flex-none">
            New Booking
          </Button>
        </div>
      </div>

      <CustomerFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        customer={customer}
        onSuccess={() => window.location.reload()} 
      />
    </div>
  );
}
