"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Wallet,
  Smartphone,
  Lock,
  ShieldCheck,
  Shield,
  HelpCircle,
  Headphones,
  CheckCircle,
  Clock,
  CircleDot,
  ChevronLeft,
} from "lucide-react";
import { getLocalCart, setLocalCart } from "@/lib/cart/local-cart";
import { supabase } from "@/lib/supabase/client";
import {
  createLocalBookingsFromCart,
  markLocalBookingGroupPaid,
  upsertLocalBookingsByRef,
} from "@/lib/bookings/local-bookings";
import { BookingProgress } from "@/components/features/booking-flow/booking-progress";

type PaymentState = "pending" | "success" | "failed";
type PaymentMethod = "card" | "mobile" | "ewallet";

type BuyerInfo = {
  name: string;
  email: string;
  phone: string;
  note: string;
};

const paymentMethods: Array<{
  key: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
}> = [
  { key: "card", label: "Card", icon: CreditCard },
  { key: "mobile", label: "Mobile Banking", icon: Wallet },
  { key: "ewallet", label: "E-Wallet", icon: Smartphone },
];

export default function PaymentPage() {
  const router = useRouter();
  const [state, setState] = useState<PaymentState>("pending");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [items] = useState(() => getLocalCart());
  const [isSaving, setIsSaving] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState("");
  const [checkoutBookingRef, setCheckoutBookingRef] = useState("");
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: "",
    email: "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!data.user) {
        router.replace("/login?next=/payment");
        return;
      }

      const user = data.user;
      const meta = user.user_metadata ?? {};
      const name =
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        "";
      const phone =
        (typeof meta.phone === "string" && meta.phone.trim()) ||
        (typeof meta.phone_number === "string" &&
          meta.phone_number.trim()) ||
        "";
      setBuyerInfo((prev) => ({
        name: prev.name || name,
        email: prev.email || user.email || "",
        phone: prev.phone || phone,
        note: prev.note,
      }));

      setCheckedAuth(true);
    };
    void verify();
    return () => {
      mounted = false;
    };
  }, [router]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );
  const totalPax = useMemo(
    () => items.reduce((sum, item) => sum + item.pax, 0),
    [items],
  );
  const payableTotal = Math.max(0, total - checkoutDiscount);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.sessionStorage.getItem("6cat_checkout_buyer_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        bookingRef?: string;
        discount?: number;
        promoCode?: string;
        name?: string;
        email?: string;
        phone?: string;
        note?: string;
      };

      const discountValue =
        typeof parsed.discount === "number"
          ? Math.max(0, parsed.discount)
          : 0;
      const promo =
        typeof parsed.promoCode === "string"
          ? parsed.promoCode.trim().toUpperCase()
          : "";
      const bookingRef =
        typeof parsed.bookingRef === "string" ? parsed.bookingRef : "";

      setCheckoutDiscount(discountValue);
      setCheckoutPromoCode(promo);
      setCheckoutBookingRef(bookingRef);
      setBuyerInfo({
        name: typeof parsed.name === "string" ? parsed.name : "",
        email: typeof parsed.email === "string" ? parsed.email : "",
        phone: typeof parsed.phone === "string" ? parsed.phone : "",
        note: typeof parsed.note === "string" ? parsed.note : "",
      });
    } catch {
      setCheckoutDiscount(0);
      setCheckoutPromoCode("");
      setCheckoutBookingRef("");
      setBuyerInfo({ name: "", email: "", phone: "", note: "" });
    }
  }, []);

  const completePayment = () => {
    if (state !== "success" || items.length === 0 || isSaving) return;
    setIsSaving(true);
    const bookingRef =
      checkoutBookingRef ||
      `BK-6CAT-${Date.now().toString().slice(-8)}`;

    if (checkoutBookingRef) {
      markLocalBookingGroupPaid(bookingRef);
    } else {
      const created = createLocalBookingsFromCart(items, bookingRef);
      upsertLocalBookingsByRef(bookingRef, created);
    }

    setLocalCart([]);
    router.push(`/thank-you?ref=${encodeURIComponent(bookingRef)}`);
  };

  if (!checkedAuth) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-24 text-sm text-gray-500">
        Checking account...
      </div>
    );
  }

  return (
    <div>
      <BookingProgress current="payment" />

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3 lg:px-10">
          <Link
            href="/checkout"
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 text-gray-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Review
              </span>
            </div>
            <div className="h-px w-8 bg-gray-200" />
            <div className="flex items-center gap-2 text-primary">
              <CircleDot className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Payment
              </span>
            </div>
            <div className="h-px w-8 bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Confirm
              </span>
            </div>
          </nav>

          <div className="flex h-10 items-center gap-2 rounded-lg bg-gray-100 px-3 text-gray-700">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Secure
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Finalize Your Booking
          </h1>
          <p className="mt-2 text-gray-500">
            Complete your payment securely to confirm your trip.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column — Payment Methods */}
          <div className="flex-1 space-y-6">
            {/* Method Tabs */}
            <div className="rounded-xl border border-gray-200 bg-white p-1">
              <div className="grid grid-cols-3 gap-1">
                {paymentMethods.map((m) => {
                  const isActive = selectedMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelectedMethod(m.key)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary ring-2 ring-primary"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <m.icon className="h-5 w-5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Form */}
            {selectedMethod === "card" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Card Information</h3>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-100">
                      <span className="text-[10px] font-bold text-gray-400">
                        VISA
                      </span>
                    </div>
                    <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-100">
                      <span className="text-[10px] font-bold text-gray-400">
                        MC
                      </span>
                    </div>
                  </div>
                </div>

                <form className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <CreditCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="***"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <span title="3-digit code on the back of your card">
                          <HelpCircle className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 cursor-help text-gray-400" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="save-card"
                      className="h-5 w-5 rounded border-gray-200 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="save-card"
                      className="text-sm text-gray-500"
                    >
                      Save card information for future bookings
                    </label>
                  </div>
                </form>
              </div>
            )}

            {/* Mobile Banking / E-Wallet placeholder */}
            {selectedMethod !== "card" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
                <h3 className="text-lg font-bold">
                  {selectedMethod === "mobile"
                    ? "Mobile Banking"
                    : "E-Wallet"}
                </h3>
                <p className="mt-3 text-sm text-gray-500">
                  {selectedMethod === "mobile"
                    ? "Scan the QR code with your mobile banking app to complete the payment."
                    : "Pay using your preferred e-wallet such as TrueMoney, Rabbit LINE Pay, or GrabPay."}
                </p>
                <div className="mt-6 flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <p className="text-sm font-medium text-gray-400">
                    QR Code / Payment UI will appear here
                  </p>
                </div>
              </div>
            )}

            {/* Mock State Controls (dev helper) */}
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Payment State (Dev Mock)
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setState("pending")}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${state === "pending" ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                >
                  Set Pending
                </button>
                <button
                  type="button"
                  onClick={() => setState("failed")}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${state === "failed" ? "bg-red-100 text-red-700 ring-1 ring-red-300" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                >
                  Set Failed
                </button>
                <button
                  type="button"
                  onClick={() => setState("success")}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${state === "success" ? "bg-green-100 text-green-700 ring-1 ring-green-300" : "bg-primary text-white"}`}
                >
                  Set Success
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm">
                {state === "pending" && (
                  <p className="text-amber-600">
                    Payment is pending. Please complete your chosen method.
                  </p>
                )}
                {state === "failed" && (
                  <p className="text-red-600">
                    Payment failed. Please retry or choose another method.
                  </p>
                )}
                {state === "success" && (
                  <p className="text-green-600">
                    Payment successful. You can continue to confirmation.
                  </p>
                )}
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-primary/10 bg-primary/5 p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <ShieldCheck className="h-5 w-5 text-primary" />
                SSL Secure
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <Shield className="h-5 w-5 text-primary" />
                PCI Compliant
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <Lock className="h-5 w-5 text-primary" />
                256-Bit Encryption
              </div>
            </div>
          </div>

          {/* Right Column — Order Summary */}
          <aside className="w-full lg:w-[380px]">
            <div className="sticky top-24 space-y-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="bg-[#181310] p-4 text-white">
                  <h3 className="font-bold">Booking Summary</h3>
                </div>

                <div className="p-6">
                  {/* Buyer Info */}
                  <div className="mb-6 rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Buyer
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {buyerInfo.name || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {buyerInfo.email || "-"}
                    </p>
                    {buyerInfo.phone && (
                      <p className="text-xs text-gray-500">
                        {buyerInfo.phone}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No tour items in cart.
                      </p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.pax} guest(s) &bull;{" "}
                              {item.optionName ?? "Standard"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.tripDate}
                              {item.tripTime ? ` at ${item.tripTime}` : ""}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 space-y-3 border-t border-dashed border-gray-200 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Subtotal ({items.length} item
                        {items.length !== 1 ? "s" : ""}, {totalPax} guest
                        {totalPax !== 1 ? "s" : ""})
                      </span>
                      <span className="font-semibold text-gray-900">
                        THB {total.toLocaleString()}
                      </span>
                    </div>
                    {checkoutDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Discount
                          {checkoutPromoCode
                            ? ` (${checkoutPromoCode})`
                            : ""}
                        </span>
                        <span className="font-semibold text-green-600">
                          - THB {checkoutDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-black text-primary">
                        THB {payableTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={completePayment}
                      disabled={
                        state !== "success" ||
                        items.length === 0 ||
                        isSaving
                      }
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-4 text-lg font-extrabold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                    >
                      <Lock className="h-5 w-5" />
                      {isSaving ? "Processing..." : "Pay Now"}
                    </button>

                    <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
                      By clicking &ldquo;Pay Now&rdquo;, you agree to our{" "}
                      <a href="#" className="underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline">
                        Cancellation Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <Headphones className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h4 className="text-sm font-bold">Need assistance?</h4>
                <p className="mt-1 text-xs text-gray-500">
                  Our 24/7 support team is here to help with your payment.
                </p>
                <a
                  href="tel:+6620006000"
                  className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
                >
                  +66 2 000 6000
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
