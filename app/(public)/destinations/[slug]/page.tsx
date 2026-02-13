'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Star,
  Clock,
  Users,
  Languages,
  CheckCircle2,
  Share2,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  Plane,
  Camera,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import type { PackageOption } from '@/types/package-options';
import { addLocalCartItem } from '@/lib/cart/local-cart';
import { resolveOptionPricing } from '@/lib/pricing';
import { AnimatePresence, motion } from 'framer-motion';

type FaqItem = {
  question: string;
  answer: string;
};

type ReviewItem = {
  id: string;
  user: string;
  date: string;
  rating: number;
  content: string;
  avatar: string;
};

type PackageContentMeta = {
  rating?: number;
  reviews_count?: number;
  available_from?: string;
  available_to?: string;
  policy_text?: string;
  cancellation_policy?: string;
  refund_policy?: string;
  included_items?: string[];
  excluded_items?: string[];
  duration_text?: string;
  group_size_text?: string;
  age_range?: string;
  languages?: string[];
  badge_text?: string;
  badge_variant?: string;
  faq?: FaqItem[];
  reviews?: ReviewItem[];
};

type DestinationDetailData = {
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews_count: number;
  duration: string;
  group_size: string;
  ages: string;
  language: string;
  badge_primary: string;
  badge_secondary: string;
  description: string;
  policy_text: string;
  cancellation_policy: string;
  refund_policy: string;
  included_items: string[];
  excluded_items: string[];
  highlights: string[];
  gallery: string[];
  faq: FaqItem[];
  reviews: ReviewItem[];
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80';

const DESTINATION_DATA: DestinationDetailData = {
  title: 'Destination',
  location: 'Japan',
  price: 0,
  rating: 4.7,
  reviews_count: 0,
  duration: '1 Day',
  group_size: 'Max 10 People',
  ages: 'All Ages',
  language: 'English',
  badge_primary: 'Tour',
  badge_secondary: 'Available',
  description: 'Package information will be shown here.',
  policy_text: '',
  cancellation_policy: '',
  refund_policy: '',
  included_items: [],
  excluded_items: [],
  highlights: [],
  gallery: [FALLBACK_IMAGE],
  faq: [],
  reviews: [],
};

type OptionLike = PackageOption & { perks?: string[] };

type TripOption = {
  id: string;
  date: string;
  time?: string | null;
  maxParticipants?: number | null;
};

type ItineraryItem = {
  id: string;
  day_number: number;
  title: string;
  description: string;
};

function toAvatarInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'TR';
}

function parseContentMeta(options: unknown): PackageContentMeta | null {
  if (!Array.isArray(options)) return null;
  const raw = options.find((item) => {
    if (!item || typeof item !== 'object') return false;
    const value = item as { id?: unknown; name?: unknown };
    return value.id === '__meta__' || value.name === '__meta__';
  });
  if (!raw || typeof raw !== 'object') return null;
  const meta = (raw as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return null;
  return meta as PackageContentMeta;
}

const toLocalIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTHB = (amount: number) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)} THB`;

const parseIsoDateOrNull = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
};

const getOptionPaxRange = (option: OptionLike | undefined): { min: number; max: number | null } => {
  if (!option) return { min: 1, max: null };

  const tierMins = Array.isArray(option.pricingTiers)
    ? option.pricingTiers
        .map((tier) => Number(tier.minPax))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];
  const tierMaxes = Array.isArray(option.pricingTiers)
    ? option.pricingTiers
        .map((tier) => Number(tier.maxPax))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];

  const minFromTier = tierMins.length > 0 ? Math.min(...tierMins) : 1;
  const maxFromTier = tierMaxes.length > 0 ? Math.max(...tierMaxes) : null;
  const quota = Number(option.quota);
  const maxFromQuota = Number.isFinite(quota) && quota > 0 ? Math.floor(quota) : null;

  return {
    min: Math.max(1, minFromTier),
    max: maxFromTier ?? maxFromQuota,
  };
};

const isPrivateOption = (option: OptionLike | undefined): boolean => {
  if (!option) return false;
  if (option.groupType === 'private') return true;
  if (option.isFlatRate === true) return true;
  return /^private\b/i.test(option.description ?? '');
};

const AccordionItem = ({ title, children, isOpen, onClick }: { title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
    >
      <span className="font-semibold text-gray-900">{title}</span>
      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div 
      className={`bg-gray-50 border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="p-4 text-gray-600 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

const AnimatedWords = ({ text }: { text: string }) => (
  <AnimatePresence mode="wait" initial={false}>
    <motion.span
      key={text}
      initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -6, filter: 'blur(1px)' }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="inline-block"
    >
      {text}
    </motion.span>
  </AnimatePresence>
);

export default function DestinationDetailPage() {
  const params = useParams<{ slug?: string }>();
  const packageId = params?.slug ?? '';
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews'>('overview');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const billablePassengers = adultCount + childCount;
  const totalPassengers = adultCount + childCount + infantCount;
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [detailData, setDetailData] = useState(DESTINATION_DATA);
  const [options, setOptions] = useState<OptionLike[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedTimeTripId, setSelectedTimeTripId] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availableTrip, setAvailableTrip] = useState<TripOption | null>(null);
  const [nearbyTrips, setNearbyTrips] = useState<TripOption[]>([]);
  const [remainingByTripId, setRemainingByTripId] = useState<Record<string, number>>({});
  const [showSelectionDrawer, setShowSelectionDrawer] = useState(false);
  const [drawerPhase, setDrawerPhase] = useState<'bubble' | 'expanding' | 'ready'>('bubble');
  const [cartFly, setCartFly] = useState<{
    id: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);
  const [passengersTouched, setPassengersTouched] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedPackageId, setLoadedPackageId] = useState<string>('');
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tourStartDate, setTourStartDate] = useState<string | null>(null);
  const [tourEndDate, setTourEndDate] = useState<string | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      if (!packageId) return;
      setLoading(true);
      setLoadedPackageId('');
      setNotFound(false);
      setLoadError(null);

      try {
        const [{ data: pkg, error: pkgError }, { data: tripRows }, { data: itineraryRows }] = await Promise.all([
          supabase
            .from('packages')
            .select('id, name, destination, description, base_price, highlights, image_url, image_urls, options, duration, max_pax, category, status')
            .eq('id', packageId)
            .maybeSingle(),
          supabase
            .from('trips')
            .select('id, date, time, max_participants')
            .eq('package_id', packageId)
            .eq('status', 'scheduled')
            .order('date', { ascending: true }),
          supabase
            .from('package_itinerary_items')
            .select('id, day_number, title, description, sort_order')
            .eq('package_id', packageId)
            .order('sort_order', { ascending: true })
            .order('day_number', { ascending: true }),
        ]);

        if (pkgError || !pkg) {
          setNotFound(true);
          setLoadedPackageId(packageId);
          return;
        }

        const contentMeta = parseContentMeta(pkg.options);
        const rangeStart = parseIsoDateOrNull(contentMeta?.available_from);
        const rangeEnd = parseIsoDateOrNull(contentMeta?.available_to);
        const packageOptions = Array.isArray(pkg.options)
          ? (pkg.options as OptionLike[]).filter((option) => option?.id !== '__meta__' && option?.name !== '__meta__')
          : [];

        setTourStartDate(rangeStart);
        setTourEndDate(rangeEnd);
        if (rangeStart) {
          const [year, month] = rangeStart.split('-').map(Number);
          if (Number.isFinite(year) && Number.isFinite(month)) {
            setCalendarMonth(new Date(year, month - 1, 1));
          }
        }

        setDetailData((prev) => {
          const coverImage = typeof pkg.image_url === 'string' && pkg.image_url.trim().length > 0
            ? pkg.image_url.trim()
            : null;
          const galleryImages = Array.isArray(pkg.image_urls)
            ? pkg.image_urls
                .filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
                .map((image) => image.trim())
            : [];
          const packageGallery = Array.from(new Set([coverImage, ...galleryImages].filter(Boolean))) as string[];

          const normalizedFaq = Array.isArray(contentMeta?.faq)
            ? contentMeta.faq.filter((item) => item?.question && item?.answer)
            : [];
          const normalizedReviews = Array.isArray(contentMeta?.reviews)
            ? contentMeta.reviews.filter((item) => item?.user && item?.content)
            : [];

          return {
            ...prev,
            title: pkg.name,
            location: pkg.destination ?? prev.location,
            price: Number(pkg.base_price ?? prev.price),
            description: pkg.description ?? prev.description,
            duration: contentMeta?.duration_text ?? pkg.duration ?? prev.duration,
            group_size: contentMeta?.group_size_text ?? `Max ${Number(pkg.max_pax ?? 1)} People`,
            ages: contentMeta?.age_range ?? prev.ages,
            language:
              Array.isArray(contentMeta?.languages) && contentMeta.languages.length > 0
                ? contentMeta.languages.join(', ')
                : prev.language,
            rating: Number(contentMeta?.rating ?? prev.rating),
            reviews_count: Number(contentMeta?.reviews_count ?? normalizedReviews.length ?? prev.reviews_count),
            badge_primary: contentMeta?.badge_text ?? pkg.category ?? 'Tour',
            badge_secondary: contentMeta?.badge_variant ?? (pkg.status === 'published' ? 'Best Seller' : 'Available'),
            policy_text: contentMeta?.policy_text ?? prev.policy_text,
            cancellation_policy: contentMeta?.cancellation_policy ?? prev.cancellation_policy,
            refund_policy: contentMeta?.refund_policy ?? prev.refund_policy,
            included_items:
              Array.isArray(contentMeta?.included_items) && contentMeta.included_items.length > 0
                ? contentMeta.included_items
                : prev.included_items,
            excluded_items:
              Array.isArray(contentMeta?.excluded_items) && contentMeta.excluded_items.length > 0
                ? contentMeta.excluded_items
                : prev.excluded_items,
            highlights: Array.isArray(pkg.highlights) ? pkg.highlights : prev.highlights,
            gallery: packageGallery.length > 0 ? packageGallery : [FALLBACK_IMAGE],
            faq: normalizedFaq,
            reviews: normalizedReviews,
          };
        });

        if (packageOptions.length > 0) {
          setOptions(packageOptions);
        } else {
          setOptions([]);
        }
        setSelectedOption('');

        const mappedTrips =
          tripRows?.map((trip) => ({
            id: trip.id,
            date: trip.date,
            time: trip.time,
            maxParticipants: trip.max_participants,
          }))
            .filter((trip) => {
              if (rangeStart && trip.date < rangeStart) return false;
              if (rangeEnd && trip.date > rangeEnd) return false;
              return true;
            }) ?? [];

        const tripIds = mappedTrips.map((trip) => trip.id);
        let remainingMap: Record<string, number> = {};

        if (tripIds.length > 0) {
          const { data: bookingRows } = await supabase
            .from('bookings')
            .select('trip_id, pax, status')
            .in('trip_id', tripIds)
            .neq('status', 'cancelled');

          const bookedPaxMap = new Map<string, number>();
          (bookingRows ?? []).forEach((row) => {
            const tripId = row.trip_id as string;
            const pax = Number(row.pax ?? 0);
            bookedPaxMap.set(tripId, (bookedPaxMap.get(tripId) ?? 0) + pax);
          });

          remainingMap = Object.fromEntries(
            mappedTrips.map((trip) => {
              const max = Number(trip.maxParticipants ?? 0);
              const booked = bookedPaxMap.get(trip.id) ?? 0;
              return [trip.id, Math.max(0, max - booked)];
            })
          );
        }

        setTrips(mappedTrips);
        setItineraryItems(
          (itineraryRows ?? []).map((row) => ({
            id: row.id,
            day_number: Number(row.day_number ?? 1),
            title: String(row.title ?? ''),
            description: String(row.description ?? ''),
          }))
        );
        setRemainingByTripId(remainingMap);
        setSelectedTripId('');
        setSelectedTimeTripId('');
        setSelectedTimeSlot('');
        setSelectedDate('');
        setShowDatePicker(false);
        setAvailabilityChecked(false);
        setAvailableTrip(null);
        setNearbyTrips([]);

        setLoadedPackageId(packageId);
      } catch (error) {
        console.error('Failed to load destination package:', error);
        setLoadError('Unable to load destination data right now. Please try again.');
        setLoadedPackageId(packageId);
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [packageId]);

  const selectedOptionData = useMemo(
    () => options.find((option) => option.id === selectedOption),
    [options, selectedOption]
  );

  const selectedOptionPaxRange = useMemo(
    () => getOptionPaxRange(selectedOptionData),
    [selectedOptionData]
  );

  const selectedIsPrivate = isPrivateOption(selectedOptionData);
  const selectedPricingOption = useMemo(() => {
    if (!selectedOptionData) return undefined;
    if (!selectedIsPrivate) return selectedOptionData;
    return {
      ...selectedOptionData,
      isFlatRate: true,
      flatRatePrice:
        typeof selectedOptionData.adultPrice === 'number' && selectedOptionData.adultPrice > 0
          ? selectedOptionData.adultPrice
          : selectedOptionData.flatRatePrice,
    };
  }, [selectedIsPrivate, selectedOptionData]);
  const effectiveBillablePassengers = selectedIsPrivate ? adultCount : billablePassengers;
  const effectiveTotalPassengers = selectedIsPrivate ? adultCount : totalPassengers;

  const pricing = useMemo(
    () => resolveOptionPricing(selectedPricingOption, effectiveBillablePassengers, detailData.price),
    [selectedPricingOption, effectiveBillablePassengers, detailData.price]
  );

  const passengerPricing = useMemo(() => {
    const adultUnit =
      typeof selectedOptionData?.adultPrice === 'number' && selectedOptionData.adultPrice >= 0
        ? selectedOptionData.adultPrice
        : pricing.unitPrice;
    const childUnit =
      typeof selectedOptionData?.childPrice === 'number' && selectedOptionData.childPrice >= 0
        ? selectedOptionData.childPrice
        : adultUnit;
    const infantUnit =
      typeof selectedOptionData?.infantPrice === 'number' && selectedOptionData.infantPrice >= 0
        ? selectedOptionData.infantPrice
        : 0;

    if (pricing.isFlatRate) {
      return {
        adultUnit,
        childUnit,
        infantUnit,
        total: pricing.total,
      };
    }

    return {
      adultUnit,
      childUnit,
      infantUnit,
      total: adultCount * adultUnit + childCount * childUnit + infantCount * infantUnit,
    };
  }, [adultCount, childCount, infantCount, pricing, selectedOptionData]);

  const tripsByDate = useMemo(() => {
    const map = new Map<string, TripOption>();
    trips.forEach((trip) => {
      if (!trip.date) return;
      if (!map.has(trip.date)) map.set(trip.date, trip);
    });
    return map;
  }, [trips]);

  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const todayAvailable = tripsByDate.has(todayIso);
  const canSelectDate = (isoDate: string) => {
    if (tourStartDate && isoDate < tourStartDate) return false;
    if (tourEndDate && isoDate > tourEndDate) return false;
    return true;
  };

  const calendarDays = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const startWeekday = start.getDay();
    const daysInMonth = end.getDate();

    const cells: Array<{ date: string | null; day: number | null }> = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d);
      const iso = toLocalIsoDate(date);
      cells.push({ date: iso, day: d });
    }
    return cells;
  }, [calendarMonth]);

  const monthLabel = useMemo(
    () => calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [calendarMonth]
  );

  const canGoPrevMonth = useMemo(() => {
    if (!tourStartDate) return true;
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    const [y, m] = tourStartDate.split('-').map(Number);
    const startMonth = new Date(y, m - 1, 1);
    return prev >= startMonth;
  }, [calendarMonth, tourStartDate]);

  const canGoNextMonth = useMemo(() => {
    if (!tourEndDate) return true;
    const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    const [y, m] = tourEndDate.split('-').map(Number);
    const endMonth = new Date(y, m - 1, 1);
    return next <= endMonth;
  }, [calendarMonth, tourEndDate]);

  const tourDateRangeLabel = useMemo(() => {
    if (tourStartDate && tourEndDate) return `${tourStartDate} to ${tourEndDate}`;
    if (tourStartDate) return `From ${tourStartDate}`;
    if (tourEndDate) return `Until ${tourEndDate}`;
    return 'No date range set';
  }, [tourStartDate, tourEndDate]);

  const tripsForSelectedDate = useMemo(
    () => (selectedDate ? trips.filter((trip) => trip.date === selectedDate) : []),
    [selectedDate, trips]
  );

  const selectedTimeTrip = useMemo(
    () => (selectedTimeTripId ? trips.find((trip) => trip.id === selectedTimeTripId) ?? null : null),
    [selectedTimeTripId, trips]
  );

  const tripsByTimeForSelectedDate = useMemo(() => {
    const map = new Map<string, TripOption>();
    tripsForSelectedDate.forEach((trip) => {
      const key = (trip.time ?? 'Flexible').slice(0, 5);
      if (!map.has(key)) map.set(key, trip);
    });
    return map;
  }, [tripsForSelectedDate]);

  const selectedWeekday = useMemo(() => {
    if (!selectedDate) return null;
    const dayIndex = new Date(`${selectedDate}T00:00:00`).getDay();
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex] as
      | 'Sun'
      | 'Mon'
      | 'Tue'
      | 'Wed'
      | 'Thu'
      | 'Fri'
      | 'Sat';
  }, [selectedDate]);

  // Contract: Time Source Rules - 1.1 Runtime Truth
  // Only use trips.time. Do not fallback to options.times.
  const optionTimeSlotsById = useMemo(() => {
    const result = new Map<string, string[]>();

    options.forEach((option) => {
      const fromRules = Array.isArray(option.slotRules) && selectedWeekday
        ? option.slotRules
            .filter((rule) => rule.day === selectedWeekday)
            .map((rule) => String(rule.time ?? '').slice(0, 5))
            .filter((time) => /^\d{2}:\d{2}$/.test(time))
        : [];

      const fromTimes = Array.isArray(option.times)
        ? option.times
            .map((time) => String(time ?? '').slice(0, 5))
            .filter((time) => /^\d{2}:\d{2}$/.test(time))
        : [];

      const candidateTimes = selectedDate
        ? fromRules
        : (fromRules.length > 0 ? fromRules : fromTimes);
      const uniqueTimes = Array.from(new Set(candidateTimes));
      const availableTimes = selectedDate
        ? uniqueTimes.filter((time) => tripsByTimeForSelectedDate.has(time))
        : uniqueTimes;

      result.set(option.id, availableTimes);
    });

    return result;
  }, [options, selectedDate, selectedWeekday, tripsByTimeForSelectedDate]);

  const visibleOptions = useMemo(() => {
    if (!selectedDate) return [];
    return options.filter((option) => (optionTimeSlotsById.get(option.id)?.length ?? 0) > 0);
  }, [options, optionTimeSlotsById, selectedDate]);

  const selectedOptionTimeSlots = useMemo(() => {
    if (!selectedOption) return [];
    return optionTimeSlotsById.get(selectedOption) ?? [];
  }, [optionTimeSlotsById, selectedOption]);

  const requiresPackageSelection = selectedDate ? visibleOptions.length > 0 : false;

  useEffect(() => {
    if (!selectedDate) return;
    if (selectedOption && !visibleOptions.some((option) => option.id === selectedOption)) {
      setSelectedOption('');
      setSelectedTimeSlot('');
      setSelectedTripId('');
      setSelectedTimeTripId('');
      setAvailabilityChecked(false);
      setAvailableTrip(null);
    }
  }, [selectedDate, selectedOption, visibleOptions]);

  useEffect(() => {
    if (!selectedOptionData) return;

    if (selectedIsPrivate) {
      const minPax = selectedOptionPaxRange.min;
      const maxPax = selectedOptionPaxRange.max;
      setChildCount(0);
      setInfantCount(0);
      setAdultCount((prev) => {
        const clampedMin = Math.max(prev, minPax);
        return maxPax ? Math.min(clampedMin, maxPax) : clampedMin;
      });
      return;
    }

    setAdultCount((prev) => Math.max(1, prev));
  }, [selectedIsPrivate, selectedOptionData, selectedOptionPaxRange.max, selectedOptionPaxRange.min]);

  const canAddToCart =
    !!selectedDate && (!requiresPackageSelection || !!selectedOption) && adultCount > 0 && availabilityChecked && !!availableTrip;

  const reviewDistribution = useMemo(() => {
    const counts = new Map<number, number>();
    for (let i = 1; i <= 5; i += 1) counts.set(i, 0);
    detailData.reviews.forEach((review) => {
      const score = Math.max(1, Math.min(5, Math.round(review.rating)));
      counts.set(score, (counts.get(score) ?? 0) + 1);
    });
    const total = detailData.reviews.length;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts.get(star) ?? 0,
      percent: total > 0 ? ((counts.get(star) ?? 0) / total) * 100 : 0,
    }));
  }, [detailData.reviews]);

  useEffect(() => {
    if (!showSelectionDrawer) return;

    setDrawerPhase('bubble');
    const expandTimer = window.setTimeout(() => setDrawerPhase('expanding'), 180);
    const readyTimer = window.setTimeout(() => setDrawerPhase('ready'), 620);

    return () => {
      window.clearTimeout(expandTimer);
      window.clearTimeout(readyTimer);
    };
  }, [showSelectionDrawer]);

  const resetAvailability = () => {
    setAvailabilityChecked(false);
    setAvailableTrip(null);
    setNearbyTrips([]);
    setSelectedTripId('');
    setSelectedTimeTripId('');
    setBookingError(null);
    setBookingSuccess(null);
    setCartNotice(null);
  };

  const triggerDrawerToCartAnimation = () => {
    const addButton = document.getElementById('drawer-add-to-cart-btn');
    const cartAnchor = document.querySelector('[data-cart-anchor="true"]') as HTMLElement | null;

    if (!addButton || !cartAnchor) {
      setShowSelectionDrawer(false);
      return;
    }

    const fromRect = addButton.getBoundingClientRect();
    const toRect = cartAnchor.getBoundingClientRect();

    setDrawerPhase('bubble');

    window.setTimeout(() => {
      setCartFly({
        id: Date.now(),
        fromX: fromRect.left + fromRect.width / 2,
        fromY: fromRect.top + fromRect.height / 2,
        toX: toRect.left + toRect.width / 2,
        toY: toRect.top + toRect.height / 2,
      });
    }, 260);
  };

  const handleCheckAvailability = () => {
    setBookingError(null);
    setBookingSuccess(null);
    setCartNotice(null);
    setAvailabilityChecked(false);
    setAvailableTrip(null);
    setNearbyTrips([]);

    if (!selectedDate) {
      setBookingError('Please select your preferred date.');
      return;
    }
    if (selectedDate && visibleOptions.length === 0) {
      setBookingError('No package is available for this selected date.');
      return;
    }
    if (requiresPackageSelection && !selectedOption) {
      setBookingError('Please select a package option.');
      return;
    }
    if (adultCount < 1) {
      setBookingError('Please select at least 1 adult.');
      return;
    }

    if (selectedOptionData) {
      if (effectiveTotalPassengers < selectedOptionPaxRange.min) {
        setBookingError(`Minimum ${selectedOptionPaxRange.min} travelers required for this package.`);
        return;
      }
      if (selectedOptionPaxRange.max && effectiveTotalPassengers > selectedOptionPaxRange.max) {
        setBookingError(`Maximum ${selectedOptionPaxRange.max} travelers allowed for this package.`);
        return;
      }
    }

    if (!selectedTimeSlot) {
      setBookingError('Please select a time slot.');
      return;
    }

    if (selectedOption && selectedOptionTimeSlots.length > 0 && !selectedOptionTimeSlots.includes(selectedTimeSlot)) {
      setBookingError('Selected time is not available for this package.');
      return;
    }

    const picked = tripsForSelectedDate.find(
      (trip) => ((trip.time ?? 'Flexible').slice(0, 5) || 'Flexible') === selectedTimeSlot
    );
    if (picked) {
      const remaining = remainingByTripId[picked.id] ?? Number(picked.maxParticipants ?? 0);
      if (remaining < effectiveTotalPassengers) {
        setBookingError('This time slot is sold out for the selected traveler count.');
        return;
      }

      setSelectedTripId(picked.id);
      setSelectedTimeTripId(picked.id);
      setAvailableTrip(picked);
      setAvailabilityChecked(true);
      setBookingSuccess('Great news! This date/time is available. You can add this trip to cart.');
      return;
    }

    const target = new Date(selectedDate).getTime();
    const sameTimeTrips = trips
      .filter((trip) => ((trip.time ?? 'Flexible').slice(0, 5) || 'Flexible') === selectedTimeSlot)
      .filter((trip) => (remainingByTripId[trip.id] ?? Number(trip.maxParticipants ?? 0)) >= effectiveTotalPassengers);

    const sourceTrips = sameTimeTrips.length > 0 ? sameTimeTrips : trips;

    const nearby = [...sourceTrips]
      .filter((trip) => !!trip.date)
      .map((trip) => ({
        trip,
        diff: Math.abs(new Date(trip.date).getTime() - target),
      }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 3)
      .map((item) => item.trip);

    setNearbyTrips(nearby);
    setBookingError('Selected date/time is not available. Please choose one of the nearby dates.');
  };

  const handleAddToCart = () => {
    setBookingError(null);
    setBookingSuccess(null);
    setCartNotice(null);

    if (!selectedDate) {
      setBookingError('Please select your preferred date.');
      return;
    }
    if (selectedDate && visibleOptions.length === 0) {
      setBookingError('No package is available for this selected date.');
      return;
    }
    if (requiresPackageSelection && !selectedOption) {
      setBookingError('Please select a package option.');
      return;
    }
    if (adultCount < 1) {
      setBookingError('Please select at least 1 adult.');
      return;
    }

    if (selectedOptionData) {
      if (effectiveTotalPassengers < selectedOptionPaxRange.min) {
        setBookingError(`Minimum ${selectedOptionPaxRange.min} travelers required for this package.`);
        return;
      }
      if (selectedOptionPaxRange.max && effectiveTotalPassengers > selectedOptionPaxRange.max) {
        setBookingError(`Maximum ${selectedOptionPaxRange.max} travelers allowed for this package.`);
        return;
      }
    }
    if (!availabilityChecked || !availableTrip) {
      setBookingError('Please check availability before adding to cart.');
      return;
    }

    const activeTripId = selectedTimeTripId || selectedTripId;
    const trip = trips.find((item) => item.id === activeTripId) ?? availableTrip;
    if (!trip) {
      setBookingError('Please select an available trip date.');
      return;
    }

    const itemId = `${packageId}-${trip.id}-${selectedOptionData?.id ?? 'default'}-${Date.now()}`;
    addLocalCartItem({
      id: itemId,
      packageId,
      tripId: trip.id,
      title: detailData.title,
      image: detailData.gallery[0] ?? '',
      location: detailData.location,
      tripDate: trip.date,
      tripTime: trip.time ?? undefined,
      optionId: selectedOptionData?.id ?? undefined,
      optionName: selectedOptionData?.name ?? undefined,
      pax: effectiveTotalPassengers,
      passengers: {
        adult: adultCount,
        child: selectedIsPrivate ? 0 : childCount,
        infant: selectedIsPrivate ? 0 : infantCount,
      },
      unitPrice: passengerPricing.adultUnit,
      totalPrice: passengerPricing.total,
      basePrice: detailData.price,
      pricingTiers: selectedOptionData?.pricingTiers ?? [],
      isFlatRate: pricing.isFlatRate,
      flatRatePrice: pricing.isFlatRate ? pricing.unitPrice : undefined,
      minPax: selectedOptionPaxRange.min,
      maxPax: selectedOptionPaxRange.max,
      adultUnitPrice: passengerPricing.adultUnit,
      childUnitPrice: selectedIsPrivate ? undefined : passengerPricing.childUnit,
      infantUnitPrice: selectedIsPrivate ? undefined : passengerPricing.infantUnit,
    });

    setCartNotice('Added to cart. You can review it in your cart.');
    triggerDrawerToCartAnimation();
  };

  const DestinationDetailSkeleton = () => (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-neutral-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse h-4 w-64 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse mb-8">
          <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-2/3 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-80 bg-gray-200 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="md:col-span-3 h-[320px] md:h-[420px] bg-gray-100 rounded-2xl animate-pulse" />
          <div className="hidden md:flex flex-col gap-4">
            <div className="h-[128px] bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-[128px] bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-[128px] bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (loading || loadedPackageId !== packageId) {
    return <DestinationDetailSkeleton />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-neutral-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-primary transition-colors">Destinations</Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to load destination</h1>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <Button type="button" className="rounded-lg" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-neutral-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-primary transition-colors">Destinations</Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Package not found</h1>
            <p className="text-gray-600 mb-6">We couldn't find this destination. It may have been unpublished or removed.</p>
            <Button asChild className="rounded-lg">
              <Link href="/destinations">Back to destinations</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-neutral-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/destinations" className="hover:text-primary transition-colors">Destinations</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{detailData.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">{detailData.badge_primary}</Badge>
                <Badge variant="outline" className="text-gray-600 border-gray-300">{detailData.badge_secondary}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{detailData.title}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  {detailData.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold text-gray-900">{detailData.rating}</span>
                  <span className="underline decoration-gray-300 cursor-pointer hover:text-primary">({detailData.reviews_count} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-gray-300">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-gray-300">
                <Heart className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <div className="md:col-span-3 h-full relative group overflow-hidden rounded-2xl cursor-pointer">
              <img 
                src={detailData.gallery[0] ?? FALLBACK_IMAGE} 
                alt={detailData.title} 
                className="w-full h-[320px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>
          <div className="hidden md:flex flex-col gap-4">
            {detailData.gallery.slice(1).map((img, idx) => (
              <div key={idx} className="relative group overflow-hidden rounded-2xl cursor-pointer">
                <img 
                  src={img} 
                  alt={`Gallery ${idx}`} 
                  className="w-full h-[130px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {idx === 2 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] hover:bg-black/40 transition-colors">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Camera className="w-4 h-4" /> View All
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Duration</span>
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Clock className="w-4 h-4 text-primary" />
                  {detailData.duration}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Group Size</span>
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Users className="w-4 h-4 text-primary" />
                  {detailData.group_size}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Ages</span>
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {detailData.ages}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Language</span>
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Languages className="w-4 h-4 text-primary" />
                  {detailData.language}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this tour</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {detailData.description}
              </p>

              {showDatePicker && (
                <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 md:p-6 animate-in fade-in-0 slide-in-from-top-3 duration-300">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                       <h3 className="text-lg md:text-xl font-bold text-gray-900">Pick your travel date</h3>
                       <p className="text-sm text-gray-600">
                         {todayAvailable ? 'Today is available for travel.' : 'Today is not available. Pick another date.'}
                       </p>
                       <p className="text-xs text-gray-500 mt-1">Travel window: {tourDateRangeLabel}</p>
                     </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!canGoPrevMonth}
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                        className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!canGoNextMonth}
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                        className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Next month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">{monthLabel}</div>
                      <div className="text-xs text-gray-500">Green dots = available</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-gray-500 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
                        <div key={w}>{w}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((cell, idx) => {
                        if (!cell.date || !cell.day) {
                          return <div key={`empty-${idx}`} className="h-11 rounded-lg bg-gray-50/70" />;
                        }

                        const withinRange = canSelectDate(cell.date);
                        const available = withinRange && tripsByDate.has(cell.date);
                        const selected = selectedDate === cell.date;

                        return (
                          <button
                            key={cell.date}
                            type="button"
                            disabled={!available}
                            onClick={() => {
                              setSelectedDate(cell.date as string);
                              setShowSelectionDrawer(true);
                              resetAvailability();
                            }}
                            className={`h-11 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center relative ${
                              selected
                                ? 'border-primary bg-primary text-white'
                                : available
                                  ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                                  : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {cell.day}
                            {available && !selected ? (
                              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedDate && options.length > 0 && (
                <div className="border border-gray-100 rounded-2xl p-6 bg-white mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Choose your package option</h3>

                  <div className="space-y-4">
                    {visibleOptions.length === 0 ? (
                      <p className="text-sm text-gray-500">No package is available for this selected date.</p>
                    ) : null}
                    {visibleOptions.map((option) => {
                      const optionIsPrivate = isPrivateOption(option);
                      const optionRequestedPax = optionIsPrivate ? adultCount : totalPassengers;
                      const optionPricingInput = optionIsPrivate
                        ? {
                            ...option,
                            isFlatRate: true,
                            flatRatePrice:
                              typeof option.adultPrice === 'number' && option.adultPrice > 0
                                ? option.adultPrice
                                : option.flatRatePrice,
                          }
                        : option;
                      const optionPricing = resolveOptionPricing(
                        optionPricingInput,
                        optionIsPrivate ? adultCount : billablePassengers,
                        detailData.price
                      );
                      const optionPaxRange = getOptionPaxRange(option);
                      const seatLabel = optionPaxRange.max
                        ? optionPaxRange.min === optionPaxRange.max
                          ? `${optionPaxRange.max} seats`
                          : `${optionPaxRange.min}-${optionPaxRange.max} seats`
                        : `${optionPaxRange.min}+ seats`;
                      const displayPrice =
                        optionIsPrivate
                          ? optionPricing.total
                          : typeof option.adultPrice === 'number' && option.adultPrice >= 0
                          ? option.adultPrice
                          : optionPricing.isFlatRate
                            ? optionPricing.total
                            : optionPricing.unitPrice;
                      const optionTimeSlots = optionTimeSlotsById.get(option.id) ?? [];
                      return (
                      <label
                        key={option.id}
                        className={`flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                          selectedOption === option.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="package-option"
                              checked={selectedOption === option.id}
                              onChange={() => {
                                setSelectedOption(option.id);
                                setShowSelectionDrawer(true);
                                resetAvailability();
                              }}
                              className="mt-1 h-4 w-4 accent-primary"
                            />
                            <div>
                              <h4 className="text-base font-semibold text-gray-900">{option.name}</h4>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">From</span>
                            <div className="text-lg font-bold text-primary">{formatTHB(displayPrice)}</div>
                            <div className="text-xs text-gray-500">{seatLabel}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(option.perks ?? []).map((perk) => (
                            <span
                              key={perk}
                              className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1"
                            >
                              {perk}
                            </span>
                          ))}
                        </div>

                        {selectedOption === option.id && (
                          <div className="rounded-lg border border-primary/15 bg-white p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Time Slot</p>
                            {selectedDate ? (
                              optionTimeSlots.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {optionTimeSlots.map((slot) => {
                                    const trip = tripsByTimeForSelectedDate.get(slot);
                                    const active = selectedTimeSlot === slot;
                                    const remaining = trip ? (remainingByTripId[trip.id] ?? Number(trip.maxParticipants ?? 0)) : 0;
                                    const soldOut = !!trip && remaining < optionRequestedPax;
                                    const available = !!trip && !soldOut;

                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => {
                                          setSelectedTimeSlot(slot);
                                          setSelectedTripId(trip?.id ?? '');
                                          setSelectedTimeTripId(trip?.id ?? '');
                                          setAvailableTrip(null);
                                          setAvailabilityChecked(false);
                                          setBookingSuccess(null);
                                          setBookingError(null);
                                          setShowSelectionDrawer(true);
                                        }}
                                        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                                          active
                                            ? 'border-primary bg-primary text-white'
                                            : soldOut
                                              ? 'border-red-200 bg-red-50 text-red-500 cursor-not-allowed'
                                              : !trip
                                                ? 'border-gray-200 bg-gray-100 text-gray-400'
                                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary/40'
                                        }`}
                                      >
                                        {slot}
                                        <span className={`ml-2 inline-block h-1.5 w-1.5 rounded-full ${available ? 'bg-green-500' : soldOut ? 'bg-red-500' : 'bg-gray-300'}`} />
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No scheduled time slots for this date.</p>
                              )
                            ) : (
                              <p className="text-sm text-gray-500">Choose date first, then pick your time here.</p>
                            )}
                          </div>
                        )}
                      </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Highlights</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detailData.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 min-w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              {(detailData.included_items.length > 0 || detailData.excluded_items.length > 0) && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                    <h4 className="text-base font-bold text-gray-900 mb-3">Included</h4>
                    {detailData.included_items.length === 0 ? (
                      <p className="text-sm text-gray-500">No included items listed.</p>
                    ) : (
                      <ul className="space-y-2">
                        {detailData.included_items.map((item, idx) => (
                          <li key={`included-${idx}`} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                    <h4 className="text-base font-bold text-gray-900 mb-3">Excluded</h4>
                    {detailData.excluded_items.length === 0 ? (
                      <p className="text-sm text-gray-500">No excluded items listed.</p>
                    ) : (
                      <ul className="space-y-2">
                        {detailData.excluded_items.map((item, idx) => (
                          <li key={`excluded-${idx}`} className="flex items-start gap-2 text-sm text-gray-700">
                            <Info className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
              <div className="relative border-l-2 border-primary/20 ml-3 space-y-8 pl-8 pb-4">
                {(itineraryItems.length > 0
                  ? itineraryItems.map((item) => ({
                      day: item.day_number,
                      title: item.title,
                      description: item.description,
                      icon: <MapPin className="w-5 h-5" />,
                    }))
                  : []
                ).map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-orange-50 text-accent">
                          {item.icon}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
                {itineraryItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                    No itinerary details available yet.
                  </div>
                )}
              </div>
            </div>

            {(detailData.policy_text || detailData.cancellation_policy || detailData.refund_policy) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {detailData.policy_text ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Policy</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{detailData.policy_text}</p>
                  </div>
                ) : null}

                {detailData.cancellation_policy ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Cancellation</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{detailData.cancellation_policy}</p>
                  </div>
                ) : null}

                {detailData.refund_policy ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Refund</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{detailData.refund_policy}</p>
                  </div>
                ) : null}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div>
                {detailData.faq.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                    FAQ is not available yet.
                  </div>
                ) : (
                  detailData.faq.map((item, idx) => (
                    <AccordionItem 
                      key={idx} 
                      title={item.question} 
                      isOpen={openFaqIndex === idx}
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    >
                      {item.answer}
                    </AccordionItem>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Write a Review
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="text-center md:text-left min-w-[120px]">
                  <div className="text-5xl font-bold text-gray-900 mb-1">{detailData.rating}</div>
                  <div className="flex justify-center md:justify-start gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(detailData.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Based on {detailData.reviews_count} reviews</p>
                  </div>
                
                <div className="flex-1 w-full space-y-2">
                  {reviewDistribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-3 text-sm">
                      <span className="font-medium w-3">{item.star}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detailData.reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                  No reviews yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {detailData.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                          {review.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{review.user}</h4>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <p className="text-gray-600">{review.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
              <Card className="border border-primary/15 shadow-lg shadow-gray-200/40 overflow-hidden rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-gray-500 text-sm">From</span>
                    <span className="text-3xl font-bold text-gray-900">{formatTHB(passengerPricing.adultUnit)}</span>
                    <span className="text-gray-500 text-sm">{pricing.isFlatRate ? '/ package' : '/ person'}</span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Select Date</label>
                      <p className="text-xs text-gray-500">Travel window: {tourDateRangeLabel}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDatePicker((prev) => !prev)}
                        className="w-full h-11 justify-between border-gray-200 bg-gray-50 text-gray-700 hover:bg-white hover:text-gray-700 hover:border-primary/40"
                        disabled={trips.length === 0}
                      >
                        <span>{selectedDate || 'Choose Date'}</span>
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedIsPrivate ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Travelers</label>
                            <p className="text-xs text-gray-500">
                              Private package ({selectedOptionPaxRange.min}
                              {selectedOptionPaxRange.max ? `-${selectedOptionPaxRange.max}` : "+"} pax)
                            </p>
                          </div>
                          <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                              onClick={() => {
                                setPassengersTouched(true);
                                setAdultCount(Math.max(selectedOptionPaxRange.min, adultCount - 1));
                                setShowSelectionDrawer(true);
                                resetAvailability();
                              }}
                              disabled={adultCount <= selectedOptionPaxRange.min}
                            >
                              -
                            </button>
                            <div className="w-10 text-center font-semibold text-gray-900">{adultCount}</div>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                              onClick={() => {
                                setPassengersTouched(true);
                                setAdultCount((prev) =>
                                  selectedOptionPaxRange.max ? Math.min(selectedOptionPaxRange.max, prev + 1) : prev + 1
                                );
                                setShowSelectionDrawer(true);
                                resetAvailability();
                              }}
                              disabled={!!selectedOptionPaxRange.max && adultCount >= selectedOptionPaxRange.max}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Adult</label>
                              <p className="text-xs text-gray-500">Ages 13+</p>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                              <button 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                onClick={() => {
                                  setPassengersTouched(true);
                                  setAdultCount(Math.max(1, adultCount - 1));
                                  setShowSelectionDrawer(true);
                                  resetAvailability();
                                }}
                                disabled={adultCount <= 1}
                              >
                                -
                              </button>
                              <div className="w-10 text-center font-semibold text-gray-900">{adultCount}</div>
                              <button 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600"
                                onClick={() => {
                                  setPassengersTouched(true);
                                  setAdultCount(adultCount + 1);
                                  setShowSelectionDrawer(true);
                                  resetAvailability();
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Child</label>
                              <p className="text-xs text-gray-500">Ages 3-12</p>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                              <button 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                onClick={() => {
                                  setPassengersTouched(true);
                                  setChildCount(Math.max(0, childCount - 1));
                                  setShowSelectionDrawer(true);
                                  resetAvailability();
                                }}
                                disabled={childCount <= 0}
                              >
                                -
                              </button>
                              <div className="w-10 text-center font-semibold text-gray-900">{childCount}</div>
                              <button 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600"
                                onClick={() => {
                                  setPassengersTouched(true);
                                  setChildCount(childCount + 1);
                                  setShowSelectionDrawer(true);
                                  resetAvailability();
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Infant</label>
                              <p className="text-xs text-gray-500">Ages 0-2</p>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                              <button 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                onClick={() => {
                                  setPassengersTouched(true);
                                  setInfantCount(Math.max(0, infantCount - 1));
                                  setShowSelectionDrawer(true);
                                  resetAvailability();
                                }}
                                disabled={infantCount <= 0}
                              >
                                -
                              </button>
                              <div className="w-10 text-center font-semibold text-gray-900">{infantCount}</div>
                              <button 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600"
                                onClick={() => {
                                  setPassengersTouched(true);
                                  setInfantCount(infantCount + 1);
                                  setShowSelectionDrawer(true);
                                  resetAvailability();
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                    {!pricing.isFlatRate && (
                      <>
                        {adultCount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Adult: {adultCount} × {formatTHB(passengerPricing.adultUnit)}</span>
                            <span className="font-medium text-gray-900">{formatTHB(passengerPricing.adultUnit * adultCount)}</span>
                          </div>
                        )}
                        {childCount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Child: {childCount} × {formatTHB(passengerPricing.childUnit)}</span>
                            <span className="font-medium text-gray-900">{formatTHB(passengerPricing.childUnit * childCount)}</span>
                          </div>
                        )}
                        {infantCount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Infant: {infantCount} × {formatTHB(passengerPricing.infantUnit)}</span>
                            <span className="font-medium text-gray-900">{formatTHB(passengerPricing.infantUnit * infantCount)}</span>
                          </div>
                        )}
                      </>
                    )}
                    {pricing.isFlatRate && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Private package rate</span>
                          <span className="font-medium text-gray-900">{formatTHB(pricing.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Travelers</span>
                          <span className="font-medium text-gray-900">{adultCount}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium text-gray-900">{formatTHB(0)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                      <span className="font-bold text-gray-900">Total ({effectiveTotalPassengers} travelers)</span>
                      <span className="font-bold text-primary text-lg">{formatTHB(passengerPricing.total)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl"
                    onClick={handleCheckAvailability}
                    disabled={loading || trips.length === 0}
                  >
                    Check
                  </Button>
                  {bookingError && (
                    <p className="text-sm text-destructive mt-3">{bookingError}</p>
                  )}
                  {bookingSuccess && (
                    <p className="text-sm text-green-600 mt-3">{bookingSuccess}</p>
                  )}
                  {nearbyTrips.length > 0 && (
                    <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <p className="text-xs font-medium text-amber-700 mb-2">Nearby available dates</p>
                      <div className="flex flex-wrap gap-2">
                        {nearbyTrips.map((trip) => (
                          <button
                            key={trip.id}
                            type="button"
                            onClick={() => {
                              const slot = ((trip.time ?? 'Flexible').slice(0, 5) || 'Flexible');
                              setSelectedDate(trip.date);
                              setSelectedTripId(trip.id);
                              setSelectedTimeTripId(trip.id);
                              setSelectedTimeSlot(slot);
                              setAvailableTrip(null);
                              setAvailabilityChecked(false);
                              setNearbyTrips([]);
                              setBookingError(null);
                              setBookingSuccess('Nearby date selected. Click Check to confirm.');
                            }}
                            className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          >
                            {trip.date}{trip.time ? ` • ${trip.time.slice(0, 5)}` : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {cartNotice && (
                    <p className="text-sm text-green-600 mt-3">{cartNotice}</p>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span>Free cancellation up to 24h before</span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Need help booking?</h3>
                <p className="text-sm text-gray-500 mb-4">Our travel experts are here to help you plan the perfect trip.</p>
                <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSelectionDrawer && (
        <motion.div
          id="selection-drawer"
          initial={{ opacity: 0, y: 36, scale: 0.82, width: 60 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            width: drawerPhase === 'bubble' ? 60 : drawerPhase === 'expanding' ? 320 : 'auto',
          }}
          transition={{
            opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
            scale: { type: 'spring', stiffness: 180, damping: 22, mass: 0.8 },
            width: { type: 'spring', stiffness: 130, damping: 24, mass: 0.9, delay: 0.08 },
          }}
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 h-[60px] rounded-full overflow-hidden border border-primary/30 bg-primary shadow-[0_18px_40px_rgba(15,23,42,0.28)] will-change-[transform,width]"
          style={{ maxWidth: 'calc(100vw - 24px)', minWidth: drawerPhase === 'ready' ? 360 : undefined }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {drawerPhase === 'bubble' ? (
              <motion.div
                key="bubble"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full flex items-center justify-center text-white"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.div>
            ) : drawerPhase === 'expanding' ? (
              <motion.div
                key="expanding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
                className="h-full px-4 flex items-center"
              >
                <motion.div
                  className="h-2 w-[320px] rounded-full bg-white/20"
                  animate={{ opacity: [0.45, 0.85, 0.45] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="px-2 md:px-4 h-full flex items-center justify-between gap-6"
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                  className="min-w-0 flex items-center gap-6 overflow-x-auto no-scrollbar text-sm md:text-base font-semibold text-white"
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                    className={`inline-flex items-center rounded-full bg-white/15 whitespace-nowrap overflow-hidden ${
                      selectedDate ? 'max-w-[220px] opacity-100 px-3 py-1.5' : 'max-w-0 opacity-0 px-0 py-0'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2 shrink-0" />
                    <AnimatedWords text={selectedDate || ''} />
                  </motion.div>

                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                    className={`inline-flex items-center rounded-full bg-white/15 whitespace-nowrap overflow-hidden ${
                      passengersTouched ? 'max-w-[200px] opacity-100 px-3 py-1.5' : 'max-w-0 opacity-0 px-0 py-0'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2 shrink-0" />
                    <AnimatedWords text={`${effectiveTotalPassengers} travelers`} />
                  </motion.div>

                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                    className={`inline-flex items-center rounded-full bg-white/15 whitespace-nowrap overflow-hidden ${
                      selectedOptionData?.name ? 'max-w-[360px] opacity-100 px-3 py-1.5' : 'max-w-0 opacity-0 px-0 py-0'
                    }`}
                  >
                    <Star className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      <AnimatedWords
                        text={
                          selectedOptionData?.name
                            ? `${selectedOptionData.name}${selectedTimeSlot ? ` • ${selectedTimeSlot}` : ''}`
                            : ''
                        }
                      />
                    </span>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.92, y: 4 }}
                  animate={
                    canAddToCart
                      ? { scale: [1, 1.08, 1], y: [0, -1, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={
                    canAddToCart
                      ? {
                          duration: 0.75,
                          ease: [0.22, 1, 0.36, 1],
                          repeat: Infinity,
                          repeatDelay: 1.9,
                        }
                      : { duration: 0.2 }
                  }
                >
                  <Button
                    id="drawer-add-to-cart-btn"
                    className="h-12 rounded-full border border-white/80 bg-white px-4 gap-2.5 text-primary shadow-[0_10px_24px_rgba(15,23,42,0.22)] whitespace-nowrap hover:bg-slate-100 disabled:bg-white/40 disabled:text-white/75 disabled:border-white/20"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    aria-label="Add to cart"
                    title="Add to cart"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span className="text-sm font-bold">{formatTHB(passengerPricing.total)}</span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {cartFly && (
          <motion.div
            key={cartFly.id}
            className="fixed z-[70] pointer-events-none"
            style={{ left: cartFly.fromX - 12, top: cartFly.fromY - 12 }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: cartFly.toX - cartFly.fromX,
              y: cartFly.toY - cartFly.fromY,
              scale: [1, 0.95, 0.65, 0.45],
              opacity: [1, 1, 0.9, 0.1],
            }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              setCartFly(null);
              setShowSelectionDrawer(false);
              setDrawerPhase('bubble');
              window.dispatchEvent(new Event('6cat-cart-hit'));
            }}
          >
            <div className="w-6 h-6 rounded-full bg-accent shadow-lg shadow-accent/50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
