"use client"

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";

type BookingOption = {
  id: string;
  bookingRef: string;
  customerName: string;
  packageName: string;
  tripDate?: string;
  totalAmount: number;
};

export function RecordPaymentModal() {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("Credit Card");
  const [status, setStatus] = useState("completed");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, booking_ref, total_amount, trip:trips(date, package:packages(name)), customer:customers(name)")
        .order("booking_date", { ascending: false });

      const mapped =
        data?.map((row) => {
          const trip = Array.isArray(row.trip) ? row.trip[0] : row.trip;
          const pkg = Array.isArray(trip?.package) ? trip?.package?.[0] : trip?.package;
          const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
          return {
            id: row.id,
            bookingRef: row.booking_ref,
            customerName: customer?.name ?? "-",
            packageName: pkg?.name ?? "-",
            tripDate: trip?.date ?? undefined,
            totalAmount: Number(row.total_amount ?? 0),
          };
        }) ?? [];

      setBookings(mapped);
    };

    loadBookings();
  }, []);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId),
    [bookings, selectedBookingId]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(dateString));
  };

  const handleSubmit = async () => {
    if (!selectedBookingId || !amount) {
      setError("Please select a booking and enter amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("payments").insert({
      booking_id: selectedBookingId,
      amount: Number(amount),
      payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
      method,
      status,
      note: note || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess("Payment recorded successfully.");
    setLoading(false);
    setTimeout(() => {
      setOpen(false);
      window.location.reload();
    }, 500);
  };

  const resetForm = () => {
    setSelectedBookingId("");
    setAmount("");
    setPaymentDate("");
    setMethod("Credit Card");
    setStatus("completed");
    setNote("");
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter payment details for a booking.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="booking" className="text-sm font-medium">
              Booking Reference
            </label>
            <select
              id="booking"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedBookingId}
              onChange={(event) => setSelectedBookingId(event.target.value)}
            >
              <option value="" disabled>
                Select booking...
              </option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.bookingRef} - {booking.customerName}
                </option>
              ))}
            </select>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-4 text-sm">
              {selectedBooking ? (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium">{selectedBooking.packageName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trip Date</span>
                    <span className="font-medium">{formatDate(selectedBooking.tripDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">฿{selectedBooking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Select a booking to preview details.</span>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (THB)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Payment Date
            </label>
            <Input
              id="date"
              type="datetime-local"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="method" className="text-sm font-medium">
              Payment Method
            </label>
            <select
              id="method"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PromptPay">PromptPay</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="note" className="text-sm font-medium">
              Note (Optional)
            </label>
            <textarea
              id="note"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter any additional notes..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
