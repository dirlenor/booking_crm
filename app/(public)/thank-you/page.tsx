import Link from "next/link";
import { BookingProgress } from "@/components/features/booking-flow/booking-progress";

export default function ThankYouPage({
  searchParams,
}: {
  searchParams?: { ref?: string };
}) {
  const bookingRef = searchParams?.ref ?? "BK-6CAT-PENDING";

  return (
    <div className="bg-[#fff8f4]" data-section="thank_you_page">
      <BookingProgress current="thank_you" />

      <section className="container mx-auto px-4 py-20" data-section="thank_you_card">
        <div className="mx-auto max-w-2xl rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm md:p-12">
          <Link href="/payment" className="inline-flex items-center text-sm font-semibold text-primary hover:underline" data-section="thank_you_back_button">
            ← Back to Payment
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary" data-section="thank_you_label">thank you</p>
          <h1 className="mt-3 text-4xl font-black text-gray-900 md:text-5xl" data-section="thank_you_title">Booking Confirmed</h1>
          <p className="mt-4 text-gray-600" data-section="thank_you_message">
            Your payment is recorded successfully. Our team will send travel instructions and vouchers soon.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-[#fff4ec] p-4" data-section="thank_you_reference">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">booking reference</p>
            <p className="mt-1 text-lg font-bold text-primary">{bookingRef}</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3" data-section="thank_you_actions">
            <Link href="/profile" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary/90">
              View My Bookings
            </Link>
            <Link href="/destinations" className="inline-flex h-11 items-center rounded-xl border border-gray-200 px-5 text-sm font-bold text-gray-700 hover:border-primary/30">
              Explore More Trips
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
