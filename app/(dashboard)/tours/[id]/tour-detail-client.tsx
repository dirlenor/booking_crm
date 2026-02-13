"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PackageImagesUploader } from "@/components/features/packages/package-images-uploader";
import type { PackageOption } from "@/types/package-options";

type TourStatus = "draft" | "pending_review" | "published" | "archived" | "deleted";
type ScheduleStatus = "open" | "closing_soon" | "full" | "closed" | "cancelled";
type PolicyType = "cancellation" | "refund" | "child" | "weather" | "other";
type GroupType = "private" | "join";
type PackageCurrency = "THB" | "USD" | "EUR" | "JPY";
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface PackageSlotRule {
  id: string;
  day: Weekday;
  time: string;
}

interface TourInclusionRow {
  item: string;
  is_included: boolean;
  sort_order: number;
}

interface TourPolicyRow {
  policy_type: PolicyType;
  title: string;
  description: string;
  sort_order: number;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface TourPackageProfile {
  id: string;
  package_name: string;
  group_type: GroupType;
  min_pax: number;
  max_pax: number;
  currency: PackageCurrency;
  adult_price: number;
  child_price: number;
  infant_price: number;
  discount_promotion: string;
  included_items: string;
  excluded_items: string;
  pickup_available: boolean;
  add_ons: string;
  slots: PackageSlotRule[];
}

export interface TourRow {
  id: string;
  name: string;
  destination: string;
  category_id: string | null;
  duration_days: number;
  min_pax: number;
  max_pax: number | null;
  status: TourStatus;
  description: string | null;
  meeting_point: string | null;
  tags: string[];
  is_private_tour?: boolean;
  tour_inclusions: TourInclusionRow[];
  tour_policies: TourPolicyRow[];
  featured_image_url: string | null;
  gallery_image_urls: string[];
}

export interface TourScheduleRow {
  id: string;
  tour_id: string;
  start_date: string;
  start_time: string;
  total_capacity: number;
  available_capacity: number;
  status: ScheduleStatus;
}

export interface TicketTypeRow {
  id: string;
  tour_id: string;
  name: string;
  code: string;
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
}

export interface TicketPricingRow {
  id: string;
  schedule_id: string;
  ticket_type_id: string;
  base_price: number;
  sale_price: number | null;
  quantity_available: number | null;
}

export interface TourItineraryRow {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  meals: string[];
  accommodation_name: string | null;
}

interface TourFaqRow {
  id: string;
  question: string;
  answer: string;
}

interface TourReviewRow {
  id: string;
  user: string;
  date: string;
  rating: number;
  content: string;
  avatar: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: { message: string };
}

type ApiResult<T> = ApiSuccess<T> | ApiFailure;
type TourDetailTab = "details" | "package" | "itinerary" | "content" | "photo";

const DETAIL_TABS: Array<{ id: TourDetailTab; label: string }> = [
  { id: "details", label: "Details" },
  { id: "package", label: "Package" },
  { id: "itinerary", label: "Itinerary" },
  { id: "content", label: "Content" },
  { id: "photo", label: "Photo" },
];

interface InitialContentMeta {
  faq?: Array<{ question?: string; answer?: string }>;
  reviews?: Array<{ id?: string; user?: string; date?: string; rating?: number; content?: string; avatar?: string }>;
  available_from?: string;
  available_to?: string;
}

interface TourDetailClientProps {
  initialTour: TourRow;
  initialSchedules: TourScheduleRow[];
  initialTickets: TicketTypeRow[];
  initialPricing: TicketPricingRow[];
  initialItinerary: TourItineraryRow[];
  initialContentMeta: InitialContentMeta | null;
  initialPackageOptions: PackageOption[];
  categories: CategoryOption[];
}

function statusBadgeClass(status: TourStatus): string {
  if (status === "published") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (status === "pending_review") return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  if (status === "archived") return "bg-slate-100 text-slate-700 hover:bg-slate-100";
  if (status === "deleted") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-blue-100 text-blue-700 hover:bg-blue-100";
}

function findPolicyDescription(
  policies: TourPolicyRow[],
  title: string,
  policyType?: PolicyType
): string {
  const found = policies.find((policy) => {
    if (policyType && policy.policy_type !== policyType) return false;
    return policy.title.toLowerCase() === title.toLowerCase();
  });
  return found?.description ?? "";
}

function createInitialPackageForm(): Omit<TourPackageProfile, "id"> {
  return {
    package_name: "",
    group_type: "join",
    min_pax: 1,
    max_pax: 20,
    currency: "THB",
    adult_price: 0,
    child_price: 0,
    infant_price: 0,
    discount_promotion: "",
    included_items: "",
    excluded_items: "",
    pickup_available: false,
    add_ons: "",
    slots: [],
  };
}

function normalizeSlotTime(input: string): string {
  const value = String(input ?? "").trim();
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
  return "08:00";
}

function getPackagePaxRangeFromOption(option: PackageOption): { min: number; max: number } {
  const tierMins = (option.pricingTiers ?? [])
    .map((tier) => Number(tier.minPax))
    .filter((value) => Number.isFinite(value) && value > 0);
  const tierMaxes = (option.pricingTiers ?? [])
    .map((tier) => Number(tier.maxPax))
    .filter((value) => Number.isFinite(value) && value > 0);

  const quota = Number(option.quota);
  const fromQuota = Number.isFinite(quota) && quota > 0 ? Math.floor(quota) : null;

  const min = tierMins.length > 0 ? Math.max(1, Math.min(...tierMins)) : 1;
  const maxFromTier = tierMaxes.length > 0 ? Math.max(...tierMaxes) : null;
  const max = Math.max(min, maxFromTier ?? fromQuota ?? min);

  return { min, max };
}

function mapPackageOptionToProfile(option: PackageOption, index: number): TourPackageProfile {
  const groupType: GroupType = option.groupType === "private" || option.isFlatRate ? "private" : "join";
  const range = getPackagePaxRangeFromOption(option);
  const tierPrice = option.pricingTiers?.[0]?.pricePerPerson;
  const fallbackAdult = Math.max(0, Number(option.adultPrice ?? tierPrice ?? option.flatRatePrice ?? 0) || 0);
  const privateFlat = Math.max(0, Number(option.flatRatePrice ?? option.adultPrice ?? fallbackAdult) || 0);

  return {
    id: option.id || `option-${index + 1}`,
    package_name: option.name?.trim() || `Package ${index + 1}`,
    group_type: groupType,
    min_pax: range.min,
    max_pax: range.max,
    currency: "THB",
    adult_price: groupType === "private" ? privateFlat : fallbackAdult,
    child_price: Math.max(0, Number(option.childPrice ?? 0) || 0),
    infant_price: Math.max(0, Number(option.infantPrice ?? 0) || 0),
    discount_promotion: "",
    included_items: "",
    excluded_items: "",
    pickup_available: false,
    add_ons: Array.isArray(option.perks) ? option.perks.join("\n") : "",
    slots: (option.slotRules ?? []).map((slot, slotIndex) => ({
      id: `${option.id || `option-${index + 1}`}-${slot.day}-${slot.time}-${slotIndex}`,
      day: slot.day,
      time: normalizeSlotTime(slot.time),
    })),
  };
}

function toWeekday(input: string): Weekday | null {
  const date = new Date(`${input}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const names: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[date.getDay()] ?? null;
}

function mapFallbackPackageFromTourData(input: {
  tour: TourRow;
  schedules: TourScheduleRow[];
  tickets: TicketTypeRow[];
  pricing: TicketPricingRow[];
}): TourPackageProfile[] {
  const adultTicket = input.tickets.find((ticket) => ticket.code === "ADT");
  const childTicket = input.tickets.find((ticket) => ticket.code === "CHD");
  const infantTicket = input.tickets.find((ticket) => ticket.code === "INF");

  const adultPrice = adultTicket
    ? (input.pricing.find((row) => row.ticket_type_id === adultTicket.id)?.base_price ?? 0)
    : 0;
  const childPrice = childTicket
    ? (input.pricing.find((row) => row.ticket_type_id === childTicket.id)?.base_price ?? 0)
    : 0;
  const infantPrice = infantTicket
    ? (input.pricing.find((row) => row.ticket_type_id === infantTicket.id)?.base_price ?? 0)
    : 0;

  const slotSeed = input.schedules.slice(0, 7).map((schedule, index) => {
    const day = toWeekday(schedule.start_date);
    if (!day) return null;
    return {
      id: `fallback-slot-${index + 1}`,
      day,
      time: normalizeSlotTime(schedule.start_time),
    };
  });

  const slots = slotSeed.filter((slot): slot is PackageSlotRule => slot !== null);

  return [
    {
      id: "fallback-package",
      package_name: "Default Package",
      group_type: input.tour.is_private_tour ? "private" : "join",
      min_pax: Math.max(1, Number(input.tour.min_pax) || 1),
      max_pax: Math.max(1, Number(input.tour.max_pax) || 20),
      currency: "THB",
      adult_price: Math.max(0, Number(adultPrice) || 0),
      child_price: Math.max(0, Number(childPrice) || 0),
      infant_price: Math.max(0, Number(infantPrice) || 0),
      discount_promotion: "",
      included_items: "",
      excluded_items: "",
      pickup_available: false,
      add_ons: "",
      slots,
    },
  ];
}

function toReviewAvatar(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
  return initials || "TR";
}

function createDefaultFaqRows(tourName: string): TourFaqRow[] {
  if (tourName.trim().toLowerCase() === "6cat - toyko") {
    return [
      {
        id: crypto.randomUUID(),
        question: "What is included in this Tokyo package?",
        answer: "The package includes hotel accommodation, daily breakfast, airport transfer on arrival, and guided city activities listed in the itinerary.",
      },
      {
        id: crypto.randomUUID(),
        question: "Do I need a visa for Japan?",
        answer: "Visa requirements depend on your passport. Please check with the Japanese embassy in your country before booking.",
      },
      {
        id: crypto.randomUUID(),
        question: "Can I customize free-day activities?",
        answer: "Yes. You can choose optional activities on free days, such as Disney Resort, Mt. Fuji day trip, or shopping tours.",
      },
    ];
  }
  return [];
}

function createDefaultReviewRows(tourName: string): TourReviewRow[] {
  if (tourName.trim().toLowerCase() === "6cat - toyko") {
    return [
      {
        id: crypto.randomUUID(),
        user: "Nattapong W.",
        date: "Jan 2026",
        rating: 5,
        content: "Well-organized itinerary and very smooth airport transfer. The guide gave clear instructions and useful local tips.",
        avatar: "NW",
      },
      {
        id: crypto.randomUUID(),
        user: "Ploy C.",
        date: "Dec 2025",
        rating: 4,
        content: "Great balance between guided activities and free time. Hotel location was convenient for train travel.",
        avatar: "PC",
      },
      {
        id: crypto.randomUUID(),
        user: "Arisa T.",
        date: "Nov 2025",
        rating: 5,
        content: "The package was worth it. Team was responsive and the schedule covered all key Tokyo highlights.",
        avatar: "AT",
      },
    ];
  }
  return [];
}

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TOKYO_SEED_PACKAGES: TourPackageProfile[] = [
  {
    id: "tokyo-join-smart",
    package_name: "Tokyo Join Smart",
    group_type: "join",
    min_pax: 1,
    max_pax: 20,
    currency: "THB",
    adult_price: 25900,
    child_price: 22900,
    infant_price: 8900,
    discount_promotion: "Early Bird 10% off for booking at least 30 days before departure",
    included_items: "6-night hotel stay, daily breakfast, airport transfer (arrival), city transport pass, English-speaking coordinator",
    excluded_items: "International flight, lunch/dinner, personal expenses, optional attractions",
    pickup_available: false,
    add_ons: "Airport drop-off +900 THB, Mt. Fuji day trip +2900 THB",
    slots: [
      { id: "tokyo-join-smart-mon-0800", day: "Mon", time: "08:00" },
      { id: "tokyo-join-smart-thu-0800", day: "Thu", time: "08:00" },
      { id: "tokyo-join-smart-sat-0800", day: "Sat", time: "08:00" },
    ],
  },
  {
    id: "tokyo-comfort-plus",
    package_name: "Tokyo Comfort Plus",
    group_type: "join",
    min_pax: 2,
    max_pax: 12,
    currency: "THB",
    adult_price: 32900,
    child_price: 28900,
    infant_price: 9900,
    discount_promotion: "Free Tokyo Metro 48-hour pass for first 8 bookings",
    included_items: "4-star hotel area upgrade, selected lunch set (2 meals), airport transfer round-trip, priority check-in for attractions",
    excluded_items: "International flight, visa fee, personal shopping, travel extension nights",
    pickup_available: true,
    add_ons: "Private airport meet & assist +1800 THB, Disney transfer +1200 THB",
    slots: [
      { id: "tokyo-comfort-plus-tue-0900", day: "Tue", time: "09:00" },
      { id: "tokyo-comfort-plus-fri-0900", day: "Fri", time: "09:00" },
    ],
  },
  {
    id: "tokyo-private-vip",
    package_name: "Tokyo Private VIP",
    group_type: "private",
    min_pax: 2,
    max_pax: 6,
    currency: "THB",
    adult_price: 49900,
    child_price: 43900,
    infant_price: 12900,
    discount_promotion: "Private chauffeur upgrade included for weekday departures",
    included_items: "Private vehicle with driver (10h/day), Thai-speaking tour leader, premium hotel options, flexible itinerary management",
    excluded_items: "International flight, personal shopping, premium dining upgrades, optional show tickets",
    pickup_available: true,
    add_ons: "Omakase dinner reservation service +2500 THB, private photographer +6000 THB",
    slots: [
      { id: "tokyo-private-vip-mon-0900", day: "Mon", time: "09:00" },
      { id: "tokyo-private-vip-mon-1300", day: "Mon", time: "13:00" },
      { id: "tokyo-private-vip-wed-0900", day: "Wed", time: "09:00" },
      { id: "tokyo-private-vip-wed-1300", day: "Wed", time: "13:00" },
    ],
  },
];

const TOKYO_SEED_ITINERARY: TourItineraryRow[] = [
  {
    id: "tokyo-day-1",
    day_number: 1,
    title: "Arrival in Tokyo and Shinjuku Walk",
    description:
      "Arrive at Tokyo airport, transfer to hotel, and begin with a light orientation walk around Shinjuku and Omoide Yokocho.",
    meals: ["Dinner"],
    accommodation_name: "Shinjuku Area Hotel",
  },
  {
    id: "tokyo-day-2",
    day_number: 2,
    title: "Asakusa, Senso-ji, and Tokyo Skytree",
    description:
      "Visit Senso-ji Temple, explore Nakamise shopping street, and continue to Tokyo Skytree area for city views and free time.",
    meals: ["Breakfast"],
    accommodation_name: "Shinjuku Area Hotel",
  },
  {
    id: "tokyo-day-3",
    day_number: 3,
    title: "Meiji Shrine, Harajuku, and Shibuya",
    description:
      "Start at Meiji Shrine, walk through Takeshita Street in Harajuku, and end at Shibuya Crossing and Hachiko landmark.",
    meals: ["Breakfast"],
    accommodation_name: "Shinjuku Area Hotel",
  },
  {
    id: "tokyo-day-4",
    day_number: 4,
    title: "Tokyo Bay and TeamLab / Odaiba",
    description:
      "Enjoy modern Tokyo at TeamLab and Odaiba district, with optional shopping and waterfront evening views.",
    meals: ["Breakfast"],
    accommodation_name: "Shinjuku Area Hotel",
  },
  {
    id: "tokyo-day-5",
    day_number: 5,
    title: "Free Day or Optional Mt. Fuji Tour",
    description:
      "Choose a free exploration day in Tokyo or join an optional Mt. Fuji day trip depending on weather conditions.",
    meals: ["Breakfast"],
    accommodation_name: "Shinjuku Area Hotel",
  },
  {
    id: "tokyo-day-6",
    day_number: 6,
    title: "Ginza, Akihabara, and Last Shopping",
    description:
      "Spend the final full day with flexible shopping and lifestyle exploration across Ginza, Akihabara, and nearby neighborhoods.",
    meals: ["Breakfast"],
    accommodation_name: "Shinjuku Area Hotel",
  },
  {
    id: "tokyo-day-7",
    day_number: 7,
    title: "Departure Day",
    description:
      "Hotel check-out, transfer to airport, and departure.",
    meals: ["Breakfast"],
    accommodation_name: null,
  },
];

function getSeedPackagesForTour(tourName: string): TourPackageProfile[] {
  if (tourName.trim().toLowerCase() === "6cat - toyko") {
    return TOKYO_SEED_PACKAGES;
  }
  return [];
}

function getSeedItineraryForTour(tourName: string): TourItineraryRow[] {
  if (tourName.trim().toLowerCase() === "6cat - toyko") {
    return TOKYO_SEED_ITINERARY;
  }
  return [];
}

export default function TourDetailClient({
  initialTour,
  initialSchedules,
  initialTickets,
  initialPricing,
  initialItinerary,
  initialContentMeta,
  initialPackageOptions,
  categories,
}: TourDetailClientProps) {
  const tourId = initialTour.id;
  const seededPackages = getSeedPackagesForTour(initialTour.name);
  const mappedPackageOptions = initialPackageOptions.map((option, index) => mapPackageOptionToProfile(option, index));
  const fallbackPackages = mapFallbackPackageFromTourData({
    tour: initialTour,
    schedules: initialSchedules,
    tickets: initialTickets,
    pricing: initialPricing,
  });
  const initialPackages = mappedPackageOptions.length > 0 ? mappedPackageOptions : seededPackages.length > 0 ? seededPackages : fallbackPackages;
  const seededItinerary = initialItinerary.length > 0 ? initialItinerary : getSeedItineraryForTour(initialTour.name);
  const [tour, setTour] = useState<TourRow>(initialTour);
  const [activeTab, setActiveTab] = useState<TourDetailTab>("details");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(categories);
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [tourForm, setTourForm] = useState({
    name: initialTour.name,
    destination: initialTour.destination,
    category_id: initialTour.category_id ?? "",
    duration_days: String(initialTour.duration_days),
    available_from: initialContentMeta?.available_from ?? "",
    available_to: initialContentMeta?.available_to ?? "",
    min_pax: String(initialTour.min_pax),
    max_pax: String(initialTour.max_pax ?? ""),
    status: initialTour.status,
    description: initialTour.description ?? "",
    highlights_text: initialTour.tags.join("\n"),
    included_items_text: initialTour.tour_inclusions
      .filter((row) => row.is_included)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((row) => row.item)
      .join("\n"),
    excluded_items_text: initialTour.tour_inclusions
      .filter((row) => !row.is_included)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((row) => row.item)
      .join("\n"),
    requirements: findPolicyDescription(initialTour.tour_policies, "Requirements", "other"),
    cancellation_policy: findPolicyDescription(initialTour.tour_policies, "Cancellation Policy", "cancellation"),
    refund_policy: findPolicyDescription(initialTour.tour_policies, "Refund Policy", "refund"),
    meeting_point: initialTour.meeting_point ?? "",
    pickup_available: findPolicyDescription(initialTour.tour_policies, "Pickup Available", "other").toLowerCase() === "supported",
    featured_image_url: initialTour.featured_image_url ?? "",
    gallery_image_urls: initialTour.gallery_image_urls,
  });
  const [savingTour, setSavingTour] = useState(false);

  const [packages, setPackages] = useState<TourPackageProfile[]>(initialPackages);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPackages[0]?.id ?? "");
  const [itineraryRows, setItineraryRows] = useState<TourItineraryRow[]>(seededItinerary);
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [faqRows, setFaqRows] = useState<TourFaqRow[]>(() => {
    const fromMeta = (initialContentMeta?.faq ?? [])
      .map((row) => ({
        id: crypto.randomUUID(),
        question: String(row.question ?? "").trim(),
        answer: String(row.answer ?? "").trim(),
      }))
      .filter((row) => row.question.length > 0 || row.answer.length > 0);
    return fromMeta.length > 0 ? fromMeta : createDefaultFaqRows(initialTour.name);
  });
  const [reviewRows, setReviewRows] = useState<TourReviewRow[]>(() => {
    const fromMeta = (initialContentMeta?.reviews ?? [])
      .map((row, index) => {
        const user = String(row.user ?? "").trim();
        const content = String(row.content ?? "").trim();
        const date = String(row.date ?? "").trim();
        const rating = Math.max(1, Math.min(5, Math.round(Number(row.rating ?? 5))));
        const avatar = String(row.avatar ?? "").trim().toUpperCase().slice(0, 2) || toReviewAvatar(user);
        return {
          id: String(row.id ?? "").trim() || `review-${index + 1}`,
          user,
          date,
          rating,
          content,
          avatar,
        };
      })
      .filter((row) => row.user.length > 0 || row.content.length > 0);
    return fromMeta.length > 0 ? fromMeta : createDefaultReviewRows(initialTour.name);
  });

  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>({});

  const handleSaveTour = async () => {
    setSavingTour(true);
    const galleryImageUrls = tourForm.gallery_image_urls
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
    const highlights = tourForm.highlights_text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const includedItems = tourForm.included_items_text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const excludedItems = tourForm.excluded_items_text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const normalizedFaq = faqRows
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0);
    const normalizedReviews = reviewRows
      .map((item, index) => {
        const user = item.user.trim();
        const content = item.content.trim();
        const date = item.date.trim();
        const rating = Math.max(1, Math.min(5, Math.round(Number(item.rating) || 5)));
        return {
          id: item.id || `review-${index + 1}`,
          user,
          date,
          rating,
          content,
          avatar: item.avatar.trim().toUpperCase().slice(0, 2) || toReviewAvatar(user),
        };
      })
      .filter((item) => item.user.length > 0 && item.content.length > 0);
    const averageRating =
      normalizedReviews.length > 0
        ? Number((normalizedReviews.reduce((sum, item) => sum + item.rating, 0) / normalizedReviews.length).toFixed(1))
        : undefined;
    const selectedCategoryName = categoryOptions.find((category) => category.id === tourForm.category_id)?.name?.trim();

    if (tourForm.available_from && tourForm.available_to && tourForm.available_from > tourForm.available_to) {
      alert("Tour end date must be the same or after start date.");
      setSavingTour(false);
      return;
    }

    const normalizedPackageOptions = packages
      .map((pkg, index) => {
        const perks = pkg.add_ons
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        const slotRules = pkg.slots
          .map((slot) => ({
            day: slot.day,
            time: String(slot.time ?? "").trim(),
          }))
          .filter((slot) => /^[A-Z][a-z]{2}$/.test(slot.day) && /^\d{2}:\d{2}$/.test(slot.time));
        const times = Array.from(
          new Set(
            slotRules
              .map((slot) => slot.time)
              .filter((time) => time.length > 0)
          )
        );
        return {
          id: pkg.id,
          name: pkg.package_name.trim() || `Package ${index + 1}`,
          description: `${pkg.group_type === "private" ? "Private" : "Join Group"} - ${pkg.min_pax}-${pkg.max_pax} pax`,
          groupType: pkg.group_type,
          quota: Math.max(1, Number(pkg.max_pax) || Number(pkg.min_pax) || 1),
          perks,
          times,
          slotRules,
          adultPrice: Math.max(0, Number(pkg.adult_price) || 0),
          childPrice: Math.max(0, Number(pkg.child_price) || 0),
          infantPrice: Math.max(0, Number(pkg.infant_price) || 0),
          isFlatRate: pkg.group_type === "private",
          flatRatePrice: pkg.group_type === "private" ? Math.max(0, Number(pkg.adult_price) || 0) : undefined,
          pricingTiers: [
            {
              id: `${pkg.id}-tier-1`,
              minPax: Math.max(1, Number(pkg.min_pax) || 1),
              maxPax: Number(pkg.max_pax) > 0 ? Number(pkg.max_pax) : null,
              pricePerPerson: Math.max(0, Number(pkg.adult_price) || 0),
            },
          ],
        };
      })
      .filter((pkg) => pkg.name.length > 0);
    const normalizedPackageSlotRules = packages
      .flatMap((pkg) =>
        pkg.slots.map((slot) => ({
          day: slot.day,
          time: String(slot.time ?? "").trim(),
          max_pax: Math.max(1, Number(pkg.max_pax) || Number(pkg.min_pax) || 1),
        }))
      )
      .filter((slot) => /^\d{2}:\d{2}$/.test(slot.time));

    const res = await fetch(`/api/v1/tours/${tourId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tourForm.name,
        destination: tourForm.destination,
        category_id: tourForm.category_id || null,
        duration_days: Number(tourForm.duration_days),
        min_pax: Number(tourForm.min_pax),
        max_pax: tourForm.max_pax ? Number(tourForm.max_pax) : null,
        status: tourForm.status,
        description: tourForm.description,
        tags: highlights,
        meeting_point: tourForm.meeting_point,
        included_items: includedItems,
        excluded_items: excludedItems,
        requirements: tourForm.requirements,
        cancellation_policy: tourForm.cancellation_policy,
        refund_policy: tourForm.refund_policy,
        pickup_available: tourForm.pickup_available,
        featured_image_url: tourForm.featured_image_url.trim() || null,
        gallery_image_urls: galleryImageUrls,
        package_options: normalizedPackageOptions,
        package_slot_rules: normalizedPackageSlotRules,
        content_meta: {
          faq: normalizedFaq,
          reviews: normalizedReviews,
          reviews_count: normalizedReviews.length,
          rating: averageRating,
          available_from: tourForm.available_from || undefined,
          available_to: tourForm.available_to || undefined,
          policy_text: tourForm.requirements || undefined,
          cancellation_policy: tourForm.cancellation_policy || undefined,
          refund_policy: tourForm.refund_policy || undefined,
          included_items: includedItems,
          excluded_items: excludedItems,
          badge_text: selectedCategoryName,
        },
      }),
    });
    if (!res.ok) {
      alert("Save tour failed");
      setSavingTour(false);
      return;
    }
    const json = (await res.json()) as ApiResult<TourRow>;
    if (json.success) {
      setTour((prev) => ({
        ...prev,
        ...json.data,
      }));
      setTourForm((prev) => ({
        ...prev,
        status: json.data.status,
        category_id: json.data.category_id ?? prev.category_id,
        meeting_point: json.data.meeting_point ?? prev.meeting_point,
        featured_image_url: json.data.featured_image_url ?? "",
        gallery_image_urls: json.data.gallery_image_urls,
      }));
    }
    setSavingTour(false);
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      alert("Category name is required");
      return;
    }

    setCreatingCategory(true);
    const res = await fetch("/api/v1/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      setCreatingCategory(false);
      alert("Create category failed");
      return;
    }

    const json = (await res.json()) as ApiResult<{ id: string; name: string }>;
    if (json.success) {
      setCategoryOptions((prev) => {
        const exists = prev.some((item) => item.id === json.data.id);
        if (exists) return prev;
        return [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name));
      });
      setTourForm((prev) => ({ ...prev, category_id: json.data.id }));
      setNewCategoryName("");
      setShowCategoryCreator(false);
    }

    setCreatingCategory(false);
  };

  const handleAddFaq = () => {
    setFaqRows((prev) => [...prev, { id: crypto.randomUUID(), question: "", answer: "" }]);
  };

  const handleUpdateFaq = (id: string, next: Partial<TourFaqRow>) => {
    setFaqRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...next } : row)));
  };

  const handleDeleteFaq = (id: string) => {
    setFaqRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddReview = () => {
    setReviewRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        user: "",
        date: "",
        rating: 5,
        content: "",
        avatar: "",
      },
    ]);
  };

  const handleUpdateReview = (id: string, next: Partial<TourReviewRow>) => {
    setReviewRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const merged = { ...row, ...next };
        if (typeof next.user === "string" && merged.avatar.trim().length === 0) {
          merged.avatar = toReviewAvatar(next.user);
        }
        return merged;
      })
    );
  };

  const handleDeleteReview = (id: string) => {
    setReviewRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleCreatePackage = () => {
    const newPackage: TourPackageProfile = {
      id: crypto.randomUUID(),
      ...createInitialPackageForm(),
      package_name: `Package ${packages.length + 1}`,
    };
    setPackages((prev) => [...prev, newPackage]);
    setSelectedPackageId(newPackage.id);
  };

  const updatePackage = (packageId: string, updater: (pkg: TourPackageProfile) => TourPackageProfile) => {
    setPackages((prev) => prev.map((pkg) => (pkg.id === packageId ? updater(pkg) : pkg)));
  };

  const updateSelectedPackageField = <K extends keyof Omit<TourPackageProfile, "id">>(
    field: K,
    value: Omit<TourPackageProfile, "id">[K]
  ) => {
    if (!selectedPackageId) return;
    updatePackage(selectedPackageId, (pkg) => ({ ...pkg, [field]: value }));
  };

  const toggleSlotDay = (day: Weekday) => {
    if (!selectedPackageId) return;
    updatePackage(selectedPackageId, (pkg) => {
      const hasDay = pkg.slots.some((slot) => slot.day === day);
      if (hasDay) {
        return { ...pkg, slots: pkg.slots.filter((slot) => slot.day !== day) };
      }
      return {
        ...pkg,
        slots: [...pkg.slots, { id: crypto.randomUUID(), day, time: "08:00" }],
      };
    });
  };

  const addSlotTime = (day: Weekday) => {
    if (!selectedPackageId) return;
    updatePackage(selectedPackageId, (pkg) => ({
      ...pkg,
      slots: [...pkg.slots, { id: crypto.randomUUID(), day, time: "08:00" }],
    }));
  };

  const updateSlotTime = (slotId: string, time: string) => {
    if (!selectedPackageId) return;
    updatePackage(selectedPackageId, (pkg) => ({
      ...pkg,
      slots: pkg.slots.map((slot) => (slot.id === slotId ? { ...slot, time } : slot)),
    }));
  };

  const deleteSlot = (slotId: string) => {
    if (!selectedPackageId) return;
    updatePackage(selectedPackageId, (pkg) => ({
      ...pkg,
      slots: pkg.slots.filter((slot) => slot.id !== slotId),
    }));
  };

  const handleDeletePackage = (id: string) => {
    const confirmed = window.confirm("Delete this package?");
    if (!confirmed) return;

    setPackages((prev) => {
      const next = prev.filter((pkg) => pkg.id !== id);
      if (selectedPackageId === id) {
        setSelectedPackageId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  const handleAddItineraryDay = () => {
    const maxDay = itineraryRows.reduce((max, row) => Math.max(max, row.day_number), 0);
    const nextDay = maxDay + 1;
    const nextRow: TourItineraryRow = {
      id: crypto.randomUUID(),
      day_number: nextDay,
      title: `Day ${nextDay}`,
      description: "",
      meals: [],
      accommodation_name: "",
    };
    setItineraryRows((prev) => [...prev, nextRow]);
  };

  const handleUpdateItineraryRow = (id: string, updates: Partial<TourItineraryRow>) => {
    setItineraryRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  };

  const handleDeleteItineraryDay = (id: string) => {
    const confirmed = window.confirm("Delete this itinerary day?");
    if (!confirmed) return;
    setItineraryRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSaveItinerary = async () => {
    setSavingItinerary(true);
    const payload = itineraryRows
      .map((row) => ({
        day_number: row.day_number,
        title: row.title.trim(),
        description: row.description?.trim() || null,
        meals: row.meals,
        accommodation_name: row.accommodation_name?.trim() || null,
      }))
      .filter((row) => row.title.length > 0)
      .sort((a, b) => a.day_number - b.day_number);

    const res = await fetch(`/api/v1/tours/${tourId}/itinerary`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payload }),
    });

    if (!res.ok) {
      setSavingItinerary(false);
      alert("Save itinerary failed");
      return;
    }

    const json = (await res.json()) as ApiResult<
      Array<{
        id: string;
        day_number: number;
        title: string;
        description: string | null;
        meals: string[];
        accommodation_name: string | null;
      }>
    >;

    if (json.success) {
      setItineraryRows(
        json.data.map((row) => ({
          id: row.id,
          day_number: row.day_number,
          title: row.title,
          description: row.description,
          meals: row.meals,
          accommodation_name: row.accommodation_name,
        }))
      );
    }

    setSavingItinerary(false);
  };

  const handleStatusChange = async (nextStatus: TourStatus) => {
    const res = await fetch(`/api/v1/tours/${tourId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      const json = (await res.json()) as ApiResult<unknown>;
      alert(json.success ? "Status update failed" : json.error.message);
      return;
    }
    const json = (await res.json()) as ApiResult<TourRow>;
    if (json.success) {
      setTour((prev) => ({ ...prev, ...json.data }));
      setTourForm((prev) => ({ ...prev, status: json.data.status }));
    }
  };

  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? null;
  const sortedItineraryRows = [...itineraryRows].sort((a, b) => a.day_number - b.day_number);

  const setFieldRef = (fieldId: string) =>
    (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => {
      fieldRefs.current[fieldId] = el;
    };

  const fieldBlockClass = (fieldId: string) =>
    `space-y-1 rounded-md transition-colors ${
      highlightedField === fieldId ? "border border-red-500 bg-red-50 p-2" : ""
    }`;

  return (
    <div className="flex flex-col gap-6 [&_input]:bg-white [&_select]:bg-white [&_textarea]:bg-white">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Link href="/tours" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Tours
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{tour.name}</h1>
          <p className="text-muted-foreground">Manage details, schedules, ticket types, and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusBadgeClass(tour.status)}>{tour.status.replace("_", " ")}</Badge>
          <Button variant="outline" onClick={() => handleStatusChange("published")}>Publish</Button>
          <Button variant="outline" onClick={() => handleStatusChange("archived")}>Archive</Button>
          <Button variant="outline" onClick={() => handleStatusChange("draft")}>Set Draft</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Manage</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-3">
              <div className="flex flex-col gap-1">
                {DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      activeTab === tab.id
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-transparent hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium">{tab.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex flex-col gap-6">
          {activeTab === "details" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>Tour Details</CardTitle>
                <Button className="gap-2" onClick={handleSaveTour} disabled={savingTour}>
                  <Save className="h-4 w-4" />
                  {savingTour ? "Saving..." : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Tour Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={fieldBlockClass("name")}>
                      <label htmlFor="tour-name" className="text-sm font-medium">Tour Name</label>
                      <Input id="tour-name" ref={setFieldRef("name")} value={tourForm.name} onChange={(e) => setTourForm((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className={fieldBlockClass("destination")}>
                      <label htmlFor="tour-destination" className="text-sm font-medium">Destination</label>
                      <Input id="tour-destination" ref={setFieldRef("destination")} value={tourForm.destination} onChange={(e) => setTourForm((p) => ({ ...p, destination: e.target.value }))} />
                    </div>
                    <div className={fieldBlockClass("category_id")}>
                      <label htmlFor="tour-category" className="text-sm font-medium">Tour Type / Category</label>
                      <select
                        id="tour-category"
                        ref={setFieldRef("category_id")}
                        className="h-9 w-full rounded-md border border-input px-3 text-sm"
                        value={tourForm.category_id}
                        onChange={(e) => setTourForm((p) => ({ ...p, category_id: e.target.value }))}
                      >
                        <option value="">Uncategorized</option>
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCategoryCreator((prev) => !prev)}
                        >
                          <Plus className="h-4 w-4" />
                          Add Category
                        </Button>
                      </div>
                      {showCategoryCreator ? (
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name"
                          />
                          <Button type="button" onClick={handleCreateCategory} disabled={creatingCategory}>
                            {creatingCategory ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="tour-status" className="text-sm font-medium">Status</label>
                      <select
                        id="tour-status"
                        className="h-9 w-full rounded-md border border-input px-3 text-sm"
                        value={tourForm.status}
                        onChange={(e) => setTourForm((p) => ({ ...p, status: e.target.value as TourStatus }))}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Duration Days</label>
                      <Input type="number" min="1" value={tourForm.duration_days} onChange={(e) => setTourForm((p) => ({ ...p, duration_days: e.target.value }))} />
                    </div>
                    <div className={fieldBlockClass("available_from")}>
                      <label htmlFor="tour-available-from" className="text-sm font-medium">Tour Start Date</label>
                      <Input
                        id="tour-available-from"
                        ref={setFieldRef("available_from")}
                        type="date"
                        value={tourForm.available_from}
                        onChange={(e) => setTourForm((p) => ({ ...p, available_from: e.target.value }))}
                      />
                    </div>
                    <div className={fieldBlockClass("available_to")}>
                      <label htmlFor="tour-available-to" className="text-sm font-medium">Tour End Date</label>
                      <Input
                        id="tour-available-to"
                        ref={setFieldRef("available_to")}
                        type="date"
                        value={tourForm.available_to}
                        onChange={(e) => setTourForm((p) => ({ ...p, available_to: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Min Pax</label>
                      <Input type="number" min="1" value={tourForm.min_pax} onChange={(e) => setTourForm((p) => ({ ...p, min_pax: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Max Pax</label>
                      <Input type="number" min="1" value={tourForm.max_pax} onChange={(e) => setTourForm((p) => ({ ...p, max_pax: e.target.value }))} />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label htmlFor="tour-description" className="text-sm font-medium">Description (Overview)</label>
                      <textarea
                        id="tour-description"
                        ref={setFieldRef("description")}
                        className="w-full min-h-[100px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.description}
                        onChange={(e) => setTourForm((p) => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div className={`md:col-span-2 ${fieldBlockClass("highlights_text")}`}>
                      <label htmlFor="tour-highlights" className="text-sm font-medium">Highlights (one item per line)</label>
                      <textarea
                        id="tour-highlights"
                        ref={setFieldRef("highlights_text")}
                        className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.highlights_text}
                        onChange={(e) => setTourForm((p) => ({ ...p, highlights_text: e.target.value }))}
                      />
                    </div>
                    <div className={fieldBlockClass("included_items_text")}>
                      <label htmlFor="tour-included" className="text-sm font-medium">Included (one item per line)</label>
                      <textarea
                        id="tour-included"
                        ref={setFieldRef("included_items_text")}
                        className="w-full min-h-[110px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.included_items_text}
                        onChange={(e) => setTourForm((p) => ({ ...p, included_items_text: e.target.value }))}
                      />
                    </div>
                    <div className={fieldBlockClass("excluded_items_text")}>
                      <label htmlFor="tour-excluded" className="text-sm font-medium">Excluded (one item per line)</label>
                      <textarea
                        id="tour-excluded"
                        ref={setFieldRef("excluded_items_text")}
                        className="w-full min-h-[110px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.excluded_items_text}
                        onChange={(e) => setTourForm((p) => ({ ...p, excluded_items_text: e.target.value }))}
                      />
                    </div>
                    <div className={`md:col-span-2 ${fieldBlockClass("requirements")}`}>
                      <label htmlFor="tour-requirements" className="text-sm font-medium">Requirements</label>
                      <textarea
                        id="tour-requirements"
                        ref={setFieldRef("requirements")}
                        className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.requirements}
                        onChange={(e) => setTourForm((p) => ({ ...p, requirements: e.target.value }))}
                      />
                    </div>
                    <div className={fieldBlockClass("cancellation_policy")}>
                      <label htmlFor="tour-cancellation" className="text-sm font-medium">Cancellation Policy</label>
                      <textarea
                        id="tour-cancellation"
                        ref={setFieldRef("cancellation_policy")}
                        className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.cancellation_policy}
                        onChange={(e) => setTourForm((p) => ({ ...p, cancellation_policy: e.target.value }))}
                      />
                    </div>
                    <div className={fieldBlockClass("refund_policy")}>
                      <label htmlFor="tour-refund" className="text-sm font-medium">Refund Policy</label>
                      <textarea
                        id="tour-refund"
                        ref={setFieldRef("refund_policy")}
                        className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                        value={tourForm.refund_policy}
                        onChange={(e) => setTourForm((p) => ({ ...p, refund_policy: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-sm font-semibold">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={fieldBlockClass("meeting_point")}>
                      <label htmlFor="tour-meeting-point" className="text-sm font-medium">Meeting Point</label>
                      <Input id="tour-meeting-point" ref={setFieldRef("meeting_point")} value={tourForm.meeting_point} onChange={(e) => setTourForm((p) => ({ ...p, meeting_point: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Pickup Available?</label>
                      <select
                        className="h-9 w-full rounded-md border border-input px-3 text-sm"
                        value={tourForm.pickup_available ? "yes" : "no"}
                        onChange={(e) => setTourForm((p) => ({ ...p, pickup_available: e.target.value === "yes" }))}
                      >
                        <option value="yes">Supported</option>
                        <option value="no">Not supported</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === "package" ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <CardTitle>Packages</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={handleSaveTour} disabled={savingTour}>
                      <Save className="h-4 w-4" />
                      {savingTour ? "Saving..." : "Save Packages"}
                    </Button>
                    <Button className="gap-2" onClick={handleCreatePackage}>
                      <Plus className="h-4 w-4" />
                      Add Package
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  {packages.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground text-center">
                      No package yet. Create your first package to manage pricing model and conditions.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`rounded-lg border p-3 transition-colors ${
                            selectedPackageId === pkg.id ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <button
                              type="button"
                              onClick={() => setSelectedPackageId(pkg.id)}
                              className="text-left"
                            >
                              <p className="text-sm font-semibold text-foreground">{pkg.package_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {pkg.group_type === "private" ? "Private" : "Join Group"} • {pkg.min_pax}-{pkg.max_pax} pax • {pkg.currency} {pkg.adult_price.toLocaleString()}
                              </p>
                            </button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePackage(pkg.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b pb-4">
                  <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-6">
                  {!selectedPackage ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground text-center">
                      Select or create a package to edit details.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Package Name</label>
                          <Input
                            value={selectedPackage.package_name}
                            onChange={(e) => updateSelectedPackageField("package_name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Group Type</label>
                          <select
                            className="h-9 w-full rounded-md border border-input px-3 text-sm"
                            value={selectedPackage.group_type}
                            onChange={(e) => updateSelectedPackageField("group_type", e.target.value as GroupType)}
                          >
                            <option value="join">Join Group</option>
                            <option value="private">Private</option>
                          </select>
                        </div>
                      </div>

                      {selectedPackage.group_type === "private" ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Package Price (Flat Rate)</label>
                            <Input
                              type="number"
                              min="0"
                              value={selectedPackage.adult_price}
                              onChange={(e) => updateSelectedPackageField("adult_price", Number(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">This price is applied per private package, not per person.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Adult Price</label>
                            <Input
                              type="number"
                              min="0"
                              value={selectedPackage.adult_price}
                              onChange={(e) => updateSelectedPackageField("adult_price", Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Child Price</label>
                            <Input
                              type="number"
                              min="0"
                              value={selectedPackage.child_price}
                              onChange={(e) => updateSelectedPackageField("child_price", Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Infant Price</label>
                            <Input
                              type="number"
                              min="0"
                              value={selectedPackage.infant_price}
                              onChange={(e) => updateSelectedPackageField("infant_price", Number(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Currency</label>
                          <select
                            className="h-9 w-full rounded-md border border-input px-3 text-sm"
                            value={selectedPackage.currency}
                            onChange={(e) => updateSelectedPackageField("currency", e.target.value as PackageCurrency)}
                          >
                            <option value="THB">THB</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="JPY">JPY</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Min Pax</label>
                          <Input
                            type="number"
                            min="1"
                            value={selectedPackage.min_pax}
                            onChange={(e) => updateSelectedPackageField("min_pax", Number(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Max Pax</label>
                          <Input
                            type="number"
                            min="1"
                            value={selectedPackage.max_pax}
                            onChange={(e) => updateSelectedPackageField("max_pax", Number(e.target.value) || 1)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium">Discount / Promotion</label>
                        <Input
                          value={selectedPackage.discount_promotion}
                          onChange={(e) => updateSelectedPackageField("discount_promotion", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Included (override)</label>
                          <textarea
                            className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                            value={selectedPackage.included_items}
                            onChange={(e) => updateSelectedPackageField("included_items", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Excluded (override)</label>
                          <textarea
                            className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                            value={selectedPackage.excluded_items}
                            onChange={(e) => updateSelectedPackageField("excluded_items", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Pickup Option</label>
                          <select
                            className="h-9 w-full rounded-md border border-input px-3 text-sm"
                            value={selectedPackage.pickup_available ? "yes" : "no"}
                            onChange={(e) => updateSelectedPackageField("pickup_available", e.target.value === "yes")}
                          >
                            <option value="yes">Supported</option>
                            <option value="no">Not supported</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Option Highlights (chips)</label>
                          <textarea
                            className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                            placeholder="One item per line, or comma separated"
                            value={selectedPackage.add_ons}
                            onChange={(e) => updateSelectedPackageField("add_ons", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="border-t pt-5 space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold">Slot Rules</h3>
                          <p className="text-xs text-muted-foreground">Select days (Mon-Sun) and configure one or more departure times.</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {WEEKDAYS.map((day) => {
                            const active = selectedPackage.slots.some((slot) => slot.day === day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleSlotDay(day)}
                                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>

                        <div className="space-y-3">
                          {WEEKDAYS.map((day) => {
                            const daySlots = selectedPackage.slots.filter((slot) => slot.day === day);
                            if (daySlots.length === 0) return null;

                            return (
                              <div key={day} className="rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{day}</p>
                                  <Button type="button" variant="outline" size="sm" onClick={() => addSlotTime(day)}>
                                    Add Time
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {daySlots.map((slot) => (
                                    <div key={slot.id} className="flex items-center gap-2">
                                      <Input
                                        type="time"
                                        value={slot.time}
                                        onChange={(e) => updateSlotTime(slot.id, e.target.value)}
                                        className="max-w-[180px]"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => deleteSlot(slot.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          {selectedPackage.slots.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No slot rules yet. Pick at least one weekday to start.</p>
                          ) : null}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

            </>
          ) : null}

          {activeTab === "itinerary" ? (
            <Card>
              <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
                <CardTitle>Itinerary</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleAddItineraryDay}>
                    <Plus className="h-4 w-4" />
                    Add Day
                  </Button>
                  <Button onClick={handleSaveItinerary} disabled={savingItinerary}>
                    {savingItinerary ? "Saving..." : "Save Itinerary"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {sortedItineraryRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No itinerary items yet.
                  </div>
                ) : (
                  sortedItineraryRows.map((row) => (
                    <div key={row.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Day</label>
                            <Input
                              type="number"
                              min="1"
                              value={row.day_number}
                              onChange={(e) => handleUpdateItineraryRow(row.id, { day_number: Number(e.target.value) || 1 })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Title</label>
                            <Input
                              value={row.title}
                              onChange={(e) => handleUpdateItineraryRow(row.id, { title: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteItineraryDay(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                          className="w-full min-h-[84px] rounded-md border border-input px-3 py-2 text-sm"
                          value={row.description ?? ""}
                          onChange={(e) => handleUpdateItineraryRow(row.id, { description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Meals (comma separated)</label>
                          <Input
                            value={row.meals.join(", ")}
                            onChange={(e) =>
                              handleUpdateItineraryRow(row.id, {
                                meals: e.target.value
                                  .split(",")
                                  .map((meal) => meal.trim())
                                  .filter((meal) => meal.length > 0),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Accommodation</label>
                          <Input
                            value={row.accommodation_name ?? ""}
                            onChange={(e) => handleUpdateItineraryRow(row.id, { accommodation_name: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {activeTab === "photo" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>Tour Photos</CardTitle>
                <Button className="gap-2" onClick={handleSaveTour} disabled={savingTour}>
                  <Save className="h-4 w-4" />
                  {savingTour ? "Saving..." : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Main Image</h3>
                    <p className="text-xs text-muted-foreground">Upload 1 cover image</p>
                  </div>
                  <PackageImagesUploader
                    label="Main Image"
                    maxImages={1}
                    value={tourForm.featured_image_url ? [tourForm.featured_image_url] : []}
                    storagePathPrefix={`tours/${tourId}/main`}
                    action={(next) => {
                      setTourForm((p) => ({
                        ...p,
                        featured_image_url: next[0] ?? "",
                      }));
                    }}
                  />
                </div>

                <div className="space-y-3 border-t pt-5">
                  <div>
                    <h3 className="text-sm font-semibold">Gallery Images</h3>
                    <p className="text-xs text-muted-foreground">Upload multiple images for the gallery</p>
                  </div>
                  <PackageImagesUploader
                    label="Gallery"
                    maxImages={12}
                    value={tourForm.gallery_image_urls}
                    storagePathPrefix={`tours/${tourId}/gallery`}
                    action={(next) => {
                      setTourForm((p) => ({
                        ...p,
                        gallery_image_urls: next,
                      }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === "content" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>FAQ & Reviews</CardTitle>
                <Button className="gap-2" onClick={handleSaveTour} disabled={savingTour}>
                  <Save className="h-4 w-4" />
                  {savingTour ? "Saving..." : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-sm font-semibold">FAQ</h3>
                    <Button type="button" variant="outline" onClick={handleAddFaq}>
                      <Plus className="h-4 w-4" />
                      Add FAQ
                    </Button>
                  </div>

                  {faqRows.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground text-center">
                      No FAQ yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {faqRows.map((row, index) => (
                        <div key={row.id} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">FAQ {index + 1}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteFaq(row.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Question</label>
                            <Input
                              value={row.question}
                              onChange={(e) => handleUpdateFaq(row.id, { question: e.target.value })}
                              placeholder="Enter question"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Answer</label>
                            <textarea
                              className="w-full min-h-[90px] rounded-md border border-input px-3 py-2 text-sm"
                              value={row.answer}
                              onChange={(e) => handleUpdateFaq(row.id, { answer: e.target.value })}
                              placeholder="Enter answer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-sm font-semibold">Reviews</h3>
                    <Button type="button" variant="outline" onClick={handleAddReview}>
                      <Plus className="h-4 w-4" />
                      Add Review
                    </Button>
                  </div>

                  {reviewRows.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground text-center">
                      No reviews yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviewRows.map((row, index) => (
                        <div key={row.id} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Review {index + 1}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteReview(row.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Name</label>
                              <Input
                                value={row.user}
                                onChange={(e) => handleUpdateReview(row.id, { user: e.target.value })}
                                placeholder="Traveler name"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Date</label>
                              <Input
                                value={row.date}
                                onChange={(e) => handleUpdateReview(row.id, { date: e.target.value })}
                                placeholder="Jan 2026"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Rating (1-5)</label>
                              <Input
                                type="number"
                                min="1"
                                max="5"
                                value={row.rating}
                                onChange={(e) =>
                                  handleUpdateReview(row.id, {
                                    rating: Math.max(1, Math.min(5, Number(e.target.value) || 1)),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Avatar</label>
                              <Input
                                value={row.avatar}
                                maxLength={2}
                                onChange={(e) => handleUpdateReview(row.id, { avatar: e.target.value.toUpperCase() })}
                                placeholder="AB"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-sm font-medium">Review Content</label>
                            <textarea
                              className="w-full min-h-[100px] rounded-md border border-input px-3 py-2 text-sm"
                              value={row.content}
                              onChange={(e) => handleUpdateReview(row.id, { content: e.target.value })}
                              placeholder="Write review text"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

    </div>
  );
}
