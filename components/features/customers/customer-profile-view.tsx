"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerProfileHeader } from "@/components/features/customers/customer-profile-header";
import { CustomerInfoTab } from "@/components/features/customers/customer-info-tab";
import { CustomerBookingsTab } from "@/components/features/customers/customer-bookings-tab";
import type { BookingHistory, Customer } from "@/lib/mock-data/customers";

type TabKey = "info" | "bookings";

interface CustomerProfileViewProps {
  customer: Customer;
  bookings: BookingHistory[];
}

export function CustomerProfileView({ customer, bookings }: CustomerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  return (
    <div className="flex flex-col gap-8 p-6">
      <CustomerProfileHeader customer={customer} />

      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <Button
          variant={activeTab === "info" ? "default" : "ghost"}
          onClick={() => setActiveTab("info")}
        >
          Info
        </Button>
        <Button
          variant={activeTab === "bookings" ? "default" : "ghost"}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </Button>
      </div>

      {activeTab === "info" ? (
        <CustomerInfoTab customer={customer} />
      ) : (
        <CustomerBookingsTab bookings={bookings} />
      )}
    </div>
  );
}
