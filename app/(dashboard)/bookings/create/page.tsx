import { BookingCreateForm } from "@/components/features/bookings/booking-create-form";

export default function BookingCreatePage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create New Booking</h1>
        <p className="text-muted-foreground">Select customer, package, and enter passenger details.</p>
      </div>
      
      <BookingCreateForm />
    </div>
  );
}
