"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/mock-data/bookings";
import { BookingDetailHeader } from "./booking-detail-header";
import { BookingInfoTab } from "./booking-info-tab";
import { BookingPaymentTab } from "./booking-payment-tab";

interface BookingDetailViewProps {
  booking: Booking;
  onEdit: () => void;
  onCancel: () => void;
  onRefund: () => void;
}

type TabKey = "info" | "payment";

export function BookingDetailView({ booking, onEdit, onCancel, onRefund }: BookingDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  return (
    <div className="flex flex-col gap-8 p-6 pb-20">
      <BookingDetailHeader 
        booking={booking} 
        onEdit={onEdit} 
        onCancel={onCancel} 
        onRefund={onRefund} 
      />

      <div className="flex flex-wrap items-center gap-2 border-b pb-0">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 pb-3 pt-2 hover:bg-transparent ${
            activeTab === "info" 
              ? "border-primary text-primary font-semibold" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("info")}
        >
          Booking Info
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 pb-3 pt-2 hover:bg-transparent ${
            activeTab === "payment" 
              ? "border-primary text-primary font-semibold" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("payment")}
        >
          Payment & Invoice
        </Button>
      </div>

      {activeTab === "info" ? (
        <BookingInfoTab booking={booking} />
      ) : (
        <BookingPaymentTab booking={booking} />
      )}
    </div>
  );
}
