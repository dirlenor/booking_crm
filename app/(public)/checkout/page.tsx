"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Clock3, Group, MapPin, ShieldCheck } from "lucide-react";
import { getLocalCart } from "@/lib/cart/local-cart";
import { supabase } from "@/lib/supabase/client";
import { BookingProgress } from "@/components/features/booking-flow/booking-progress";
import { createPendingLocalBookingsFromCart, upsertLocalBookingsByRef } from "@/lib/bookings/local-bookings";

export default function CheckoutPage() {
  const router = useRouter();
  const [items] = useState(() => getLocalCart());
  const [error, setError] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerNote, setBuyerNote] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"loading" | "logged_in" | "guest">("loading");

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const user = data.user;
      if (!user) {
        setAuthStatus("guest");
        return;
      }

      setAuthStatus("logged_in");
      const meta = user.user_metadata ?? {};
      const name =
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        "";
      const phone =
        (typeof meta.phone === "string" && meta.phone.trim()) ||
        (typeof meta.phone_number === "string" && meta.phone_number.trim()) ||
        "";

      if (name) setBuyerName(name);
      if (user.email) setBuyerEmail(user.email);
      if (phone) setBuyerPhone(phone);
    };

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);
  const totalGuests = useMemo(() => items.reduce((sum, item) => sum + item.pax, 0), [items]);
  const promotionDiscount = useMemo(() => {
    if (promoCode === "6CAT100") return 100;
    if (promoCode === "6CAT10") return Math.floor(subtotal * 0.1);
    return 0;
  }, [promoCode, subtotal]);
  const total = Math.max(0, subtotal - promotionDiscount);

  const applyPromotionCode = () => {
    const normalized = promoInput.trim().toUpperCase();
    if (!normalized) {
      setPromoCode("");
      setPromoMessage("Please enter a promotion code.");
      return;
    }

    if (normalized === "6CAT100" || normalized === "6CAT10") {
      setPromoCode(normalized);
      setPromoMessage(`Promotion ${normalized} applied.`);
      return;
    }

    setPromoCode("");
    setPromoMessage("Invalid promotion code.");
  };

  const proceedToPayment = async () => {
    setError(null);

    if (authStatus !== "logged_in") {
      setError("Please log in or register before payment.");
      return;
    }

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setError("Please fill buyer information before payment.");
      return;
    }

    if (!buyerEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (typeof window !== "undefined") {
      const bookingRef = `BK-6CAT-${Date.now().toString().slice(-8)}`;
      const pendingItems = createPendingLocalBookingsFromCart(items, bookingRef);
      upsertLocalBookingsByRef(bookingRef, pendingItems);

      window.sessionStorage.setItem(
        "6cat_checkout_buyer_v1",
        JSON.stringify({
          bookingRef,
          name: buyerName.trim(),
          email: buyerEmail.trim(),
          phone: buyerPhone.trim(),
          note: buyerNote.trim(),
          promoCode,
          subtotal,
          discount: promotionDiscount,
          total,
        })
      );
    }

    router.push("/payment");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f5]" data-section="checkout_page">
      <BookingProgress current="checkout" />

      <main className="container mx-auto px-4 py-8" data-section="checkout_main">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3" data-section="checkout_layout">
          <div className="space-y-8 lg:col-span-2">
            <section data-section="checkout_lead_traveler">
              <h1 className="text-3xl font-black text-gray-900">Lead Traveler Details</h1>
              <p className="mt-2 text-[#8d6e5e]">Please provide the primary contact information for this booking.</p>

              <div className="mt-6 rounded-xl border border-[#e7dfda] bg-white p-6 shadow-sm">
                <div className="mb-5" data-section="checkout_auth_gate">
                  {authStatus === "loading" ? <p className="text-sm text-gray-500">Checking account...</p> : null}
                  {authStatus === "logged_in" ? (
                    <p className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                      <BadgeCheck className="h-4 w-4" />
                      Logged in. Traveler details are prefilled.
                    </p>
                  ) : null}

                  {authStatus === "guest" ? (
                    <div className="rounded-lg border border-[#e7dfda] bg-[#fff8f4] p-4">
                      <p className="text-sm font-medium text-gray-700">Please log in or register before going to payment.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => router.push("/login?next=/checkout")}
                          className="h-10 rounded-lg bg-primary px-4 text-xs font-bold text-white hover:bg-primary/90"
                          data-section="checkout_auth_login"
                        >
                          Login
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push("/register?next=/checkout")}
                          className="h-10 rounded-lg border border-[#e7dfda] bg-white px-4 text-xs font-bold text-gray-700 hover:border-primary/40"
                          data-section="checkout_auth_register"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-bold text-[#181310]" data-section="checkout_buyer_name">
                    First Name
                    <input
                      value={buyerName}
                      onChange={(event) => setBuyerName(event.target.value)}
                      disabled={authStatus === "loading"}
                      className="w-full rounded-lg border border-[#e7dfda] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="John"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-[#181310]" data-section="checkout_buyer_phone">
                    Phone Number
                    <input
                      value={buyerPhone}
                      onChange={(event) => setBuyerPhone(event.target.value)}
                      disabled={authStatus === "loading"}
                      className="w-full rounded-lg border border-[#e7dfda] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="(555) 000-0000"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-[#181310] md:col-span-2" data-section="checkout_buyer_email">
                    Email Address
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(event) => setBuyerEmail(event.target.value)}
                      disabled={authStatus === "loading"}
                      className="w-full rounded-lg border border-[#e7dfda] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="john.doe@example.com"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section data-section="checkout_additional_requests">
              <h2 className="text-2xl font-bold text-gray-900">Additional Requests</h2>
              <p className="mt-2 text-[#8d6e5e]">Anything else we should know before your trip?</p>

              <div className="mt-6 rounded-xl border border-[#e7dfda] bg-white p-6 shadow-sm">
                <label className="flex flex-col gap-2 text-sm font-bold text-[#181310]" data-section="checkout_buyer_note">
                  Note
                  <textarea
                    rows={4}
                    value={buyerNote}
                    onChange={(event) => setBuyerNote(event.target.value)}
                    disabled={authStatus === "loading"}
                    className="w-full resize-none rounded-lg border border-[#e7dfda] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="Tell us more about your needs..."
                  />
                </label>
              </div>
            </section>

            <div className="flex items-center justify-between border-t border-[#e7dfda] pt-6" data-section="checkout_actions">
              <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-[#8d6e5e] hover:text-primary" data-section="checkout_back_button">
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </Link>

              <button
                type="button"
                onClick={() => void proceedToPayment()}
                disabled={items.length === 0 || authStatus !== "logged_in"}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300"
                data-section="checkout_cta_payment"
              >
                Proceed to Payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600" data-section="checkout_auth_notice">{error}</p>
            ) : null}
          </div>

          <aside className="lg:col-span-1" data-section="checkout_summary_column">
            <div className="sticky top-32 space-y-6">
              <div className="overflow-hidden rounded-xl border border-[#e7dfda] bg-white shadow-lg" data-section="checkout_summary">
                <div className="h-48 bg-gray-100" data-section="checkout_summary_image_wrap">
                  <img
                    src={items[0]?.image ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"}
                    alt={items[0]?.title ?? "Trip image"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold leading-tight text-[#181310]">{items[0]?.title ?? "No trip selected"}</h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-sm text-[#8d6e5e]">
                    <MapPin className="h-4 w-4" />
                    <span>{items[0]?.location ?? "-"}</span>
                  </div>

                  <div className="mt-4 space-y-3 border-y border-[#e7dfda] py-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[#8d6e5e]"><CalendarDays className="h-4 w-4" />Date</span>
                      <span className="font-bold">{items[0]?.tripDate ?? "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[#8d6e5e]"><Clock3 className="h-4 w-4" />Time</span>
                      <span className="font-bold">{items[0]?.tripTime ?? "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[#8d6e5e]"><Group className="h-4 w-4" />Travelers</span>
                      <span className="font-bold">{totalGuests} guest(s)</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-[#8d6e5e]">
                      <span>Subtotal</span>
                      <span>THB {subtotal.toLocaleString()}</span>
                    </div>

                    <div className="mt-3" data-section="checkout_promotion_code">
                      <div className="flex gap-2">
                        <input
                          value={promoInput}
                          onChange={(event) => setPromoInput(event.target.value)}
                          className="h-10 flex-1 rounded-lg border border-[#e7dfda] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                          placeholder="Promo code"
                        />
                        <button
                          type="button"
                          onClick={applyPromotionCode}
                          className="h-10 rounded-lg bg-[#fff4ec] px-4 text-xs font-bold text-gray-700 hover:bg-[#ffe7d7]"
                          data-section="checkout_apply_promo"
                        >
                          Apply
                        </button>
                      </div>
                      {promoMessage ? <p className="mt-2 text-xs font-medium text-primary">{promoMessage}</p> : null}
                    </div>

                    {promotionDiscount > 0 ? (
                      <div className="flex justify-between text-[#8d6e5e]" data-section="checkout_summary_discount">
                        <span>Discount ({promoCode})</span>
                        <span>- THB {promotionDiscount.toLocaleString()}</span>
                      </div>
                    ) : null}

                    <div className="mt-3 flex justify-between text-lg font-black text-[#181310]" data-section="checkout_summary_total">
                      <span>Total Price</span>
                      <span className="text-primary">THB {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6" data-section="checkout_trust_signals">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-[#181310]">Secure Checkout</h4>
                    <p className="text-xs text-[#8d6e5e]">Your personal data is protected with strong encryption.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-[#181310]">Free Cancellation</h4>
                    <p className="text-xs text-[#8d6e5e]">Cancel up to 24 hours before the event for a full refund.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
