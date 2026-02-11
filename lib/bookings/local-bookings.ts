import type { LocalCartItem } from "@/lib/cart/local-cart";

export type LocalBookingStatus = "upcoming" | "completed" | "cancelled";

export type LocalBookingItem = {
  id: string;
  bookingRef: string;
  tripId: string;
  title: string;
  image: string;
  location: string;
  date: string;
  time?: string;
  optionName?: string;
  pax: number;
  totalPrice: number;
  status: LocalBookingStatus;
  paymentStatus: "paid" | "pending" | "failed";
  paymentDueAt?: string;
  createdAt: string;
};

const BOOKING_KEY = "6cat_bookings_v1";

export function getLocalBookings(): LocalBookingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalBookingItem[];
  } catch {
    return [];
  }
}

export function setLocalBookings(items: LocalBookingItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKING_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("6cat-bookings-updated"));
}

export function createLocalBookingsFromCart(cartItems: LocalCartItem[], bookingRef?: string): LocalBookingItem[] {
  const groupRef = bookingRef ?? `BK-${Date.now().toString().slice(-8)}`;
  const now = new Date().toISOString();

  return cartItems.map((item, index) => ({
    id: `${groupRef}-${index + 1}`,
    bookingRef: groupRef,
    tripId: item.tripId,
    title: item.title,
    image: item.image,
    location: item.location,
    date: item.tripDate,
    time: item.tripTime,
    optionName: item.optionName,
    pax: item.pax,
    totalPrice: item.totalPrice,
    status: "upcoming",
    paymentStatus: "paid",
    createdAt: now,
  }));
}

export function createPendingLocalBookingsFromCart(cartItems: LocalCartItem[], bookingRef?: string): LocalBookingItem[] {
  const groupRef = bookingRef ?? `BK-${Date.now().toString().slice(-8)}`;
  const now = Date.now();
  const dueAt = new Date(now + 60 * 60 * 1000).toISOString();

  return cartItems.map((item, index) => ({
    id: `${groupRef}-${index + 1}`,
    bookingRef: groupRef,
    tripId: item.tripId,
    title: item.title,
    image: item.image,
    location: item.location,
    date: item.tripDate,
    time: item.tripTime,
    optionName: item.optionName,
    pax: item.pax,
    totalPrice: item.totalPrice,
    status: "upcoming",
    paymentStatus: "pending",
    paymentDueAt: dueAt,
    createdAt: new Date(now).toISOString(),
  }));
}

export function appendLocalBookings(newItems: LocalBookingItem[]) {
  const current = getLocalBookings();
  setLocalBookings([...newItems, ...current]);
}

export function upsertLocalBookingsByRef(bookingRef: string, newItems: LocalBookingItem[]) {
  const current = getLocalBookings();
  const filtered = current.filter((item) => item.bookingRef !== bookingRef);
  setLocalBookings([...newItems, ...filtered]);
}

export function markLocalBookingGroupPaid(bookingRef: string) {
  const current = getLocalBookings();
  const next = current.map((item) => {
    if (item.bookingRef !== bookingRef) return item;
    return {
      ...item,
      paymentStatus: "paid" as const,
      paymentDueAt: undefined,
    };
  });
  setLocalBookings(next);
}
