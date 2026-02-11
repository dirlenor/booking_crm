"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Heart,
  Star,
  Settings,
  LogOut,
  Calendar,
  Clock,
  User,
  Download,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getLocalBookings,
  type LocalBookingStatus,
  type LocalBookingItem,
} from "@/lib/bookings/local-bookings";

const statusLabel: Record<LocalBookingStatus, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusColor: Record<LocalBookingStatus, string> = {
  upcoming: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const sidebarNav = [
  { key: "bookings", label: "My Bookings", icon: Ticket, active: true },
  { key: "wishlist", label: "Wishlist", icon: Heart, active: false },
  { key: "reviews", label: "Reviews", icon: Star, active: false },
  { key: "settings", label: "Settings", icon: Settings, active: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const [active, setActive] = useState<LocalBookingStatus>("upcoming");
  const [bookings, setBookings] = useState<LocalBookingItem[]>([]);
  const [now, setNow] = useState(Date.now());
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    void loadUser();
  }, []);

  useEffect(() => {
    const sync = () => setBookings(getLocalBookings());
    sync();
    window.addEventListener("6cat-bookings-updated", sync);
    return () => window.removeEventListener("6cat-bookings-updated", sync);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () => bookings.filter((item) => item.status === active),
    [bookings, active],
  );

  const displayName = useMemo(() => {
    if (!user) return "Traveler Account";
    const meta = user.user_metadata ?? {};
    return (
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta.name === "string" && meta.name.trim()) ||
      user.email?.split("@")[0] ||
      "Traveler Account"
    );
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full flex-col gap-6 lg:w-80">
          <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary/10 shadow-md">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            <p className="mb-4 text-sm text-gray-500">
              {user?.email ?? "member@6catrip.com"}
            </p>

            <div className="mb-6 grid w-full grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Status
                </p>
                <p className="text-sm font-bold text-primary">Pro Traveler</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Points
                </p>
                <p className="text-sm font-bold text-gray-900">1,250 pts</p>
              </div>
            </div>

            <nav className="flex w-full flex-col gap-1">
              {sidebarNav.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    item.active
                      ? "bg-primary/10 font-bold text-primary"
                      : "font-medium text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <hr className="my-6 w-full border-gray-200" />

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-white shadow-md">
            <div className="relative z-10">
              <p className="mb-1 text-sm font-semibold opacity-90">
                Invite Friends
              </p>
              <h4 className="mb-3 text-xl font-bold leading-tight">
                Earn 200 points for every referral
              </h4>
              <button
                type="button"
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm"
              >
                Refer Now
              </button>
            </div>
            <Users className="absolute -bottom-4 -right-4 h-24 w-24 -rotate-12 text-white/10" />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900">Profile</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              User Profile &amp; Bookings
            </h1>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex gap-8 overflow-x-auto border-b border-gray-200">
            {(Object.keys(statusLabel) as LocalBookingStatus[]).map(
              (status) => {
                const count = bookings.filter(
                  (item) => item.status === status,
                ).length;
                const isActive = active === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setActive(status)}
                    className={`whitespace-nowrap border-b-2 pb-4 text-sm font-semibold transition-all ${
                      isActive
                        ? "border-primary font-bold text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {statusLabel[status]} ({count})
                  </button>
                );
              },
            )}
          </div>

          {/* Booking Cards */}
          <div className="flex flex-col gap-6">
            {filtered.map((item) => {
              const paymentBadge =
                item.paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : item.paymentStatus === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700";

              const paymentLabel =
                item.paymentStatus === "paid"
                  ? "Paid"
                  : item.paymentStatus === "pending"
                    ? "Pending"
                    : "Failed";

              let countdownEl: React.ReactNode = null;
              if (item.paymentStatus === "pending") {
                const dueMs = item.paymentDueAt
                  ? new Date(item.paymentDueAt).getTime()
                  : new Date(item.createdAt).getTime() + 60 * 60 * 1000;
                const remainingMs = Math.max(0, dueMs - now);
                const minutes = Math.floor(remainingMs / 60000);
                const seconds = Math.floor((remainingMs % 60000) / 1000);
                const label =
                  remainingMs > 0
                    ? `Pay within ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                    : "Payment window expired";
                countdownEl = (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                    {label}
                  </span>
                );
              }

              return (
                <div
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg md:flex-row"
                >
                  <div className="h-48 w-full overflow-hidden md:h-auto md:w-64">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop"
                      }
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusColor[item.status]}`}
                        >
                          {statusLabel[item.status]}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${paymentBadge}`}
                        >
                          {paymentLabel}
                        </span>
                        {countdownEl}
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {item.bookingRef}
                      </span>
                    </div>

                    <h4 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">
                      {item.title}
                    </h4>

                    <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{item.date}</span>
                      </div>
                      {item.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{item.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>
                          {item.pax} Guest{item.pax !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:flex-row">
                      <div className="flex w-full flex-col sm:w-auto">
                        <span className="text-xs font-medium text-gray-500">
                          {item.paymentStatus === "paid"
                            ? "Total Paid"
                            : "Total Price"}
                        </span>
                        <span className="text-2xl font-black text-gray-900">
                          THB {item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <button
                          type="button"
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50 sm:flex-none"
                        >
                          Details
                        </button>
                        {item.paymentStatus === "paid" ? (
                          <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 sm:flex-none"
                          >
                            <Download className="h-4 w-4" />
                            Voucher
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-bold text-gray-500 sm:flex-none"
                          >
                            <Download className="h-4 w-4" />
                            Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <Ticket className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  No bookings in this status yet.
                </p>
                <Link
                  href="/destinations"
                  className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
                >
                  Explore destinations →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
