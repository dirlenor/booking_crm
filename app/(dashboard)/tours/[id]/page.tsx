import TourDetailClient, {
  type TourItineraryRow,
  type TicketPricingRow,
  type TicketTypeRow,
  type TourRow,
  type TourScheduleRow,
} from "./tour-detail-client";
import { getPricingBySchedule } from "@/lib/supabase/pricing";
import { getTicketTypes } from "@/lib/supabase/ticket-types";
import { getCategories } from "@/lib/supabase/categories";
import { getTourById } from "@/lib/supabase/tours";
import { getPackageContentMetaByDestination, getPackageOptionsByDestination } from "@/lib/supabase/packages";

interface TourDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { id } = await params;

  const [tourRes, ticketRes, categoryRes] = await Promise.all([
    getTourById(id),
    getTicketTypes({ tourId: id, limit: 200 }),
    getCategories({ isActive: true, limit: 200 }),
  ]);

  if (!tourRes.data) {
    return <div className="text-destructive">Tour not found</div>;
  }

  const tour = tourRes.data;
  const schedules = (tour.tour_schedules ?? []) as TourScheduleRow[];
  const tickets = (ticketRes.data ?? []) as TicketTypeRow[];
  const firstScheduleId = schedules[0]?.id;
  const pricingRes = firstScheduleId ? await getPricingBySchedule(firstScheduleId) : { data: [] as TicketPricingRow[] };

  const initialTour: TourRow = {
    id: tour.id,
    name: tour.name,
    destination: tour.destination,
    category_id: tour.category_id,
    duration_days: tour.duration_days,
    min_pax: tour.min_pax,
    max_pax: tour.max_pax,
    status: tour.status,
    description: tour.description,
    meeting_point: tour.meeting_point,
    tags: tour.tags,
    is_private_tour: tour.is_private_tour,
    tour_inclusions: tour.tour_inclusions ?? [],
    tour_policies: tour.tour_policies ?? [],
    featured_image_url: tour.featured_image_url,
    gallery_image_urls: tour.gallery_image_urls ?? [],
  };

  const initialPricing = (pricingRes.data ?? []) as TicketPricingRow[];
  const initialItinerary = (tour.tour_itinerary ?? []).map((day) => ({
    id: day.id,
    day_number: day.day_number,
    title: day.title,
    description: day.description,
    meals: day.meals,
    accommodation_name: day.accommodation_name,
  })) as TourItineraryRow[];
  const contentMetaRes = await getPackageContentMetaByDestination(tour.destination);
  const packageOptionsRes = await getPackageOptionsByDestination(tour.destination);

  return (
    <TourDetailClient
      initialTour={initialTour}
      initialSchedules={schedules}
      initialTickets={tickets}
      initialPricing={initialPricing}
      initialItinerary={initialItinerary}
      initialContentMeta={contentMetaRes.data?.meta ?? null}
      initialPackageOptions={packageOptionsRes.data?.options ?? []}
      categories={(categoryRes.data ?? []).map((category) => ({ id: category.id, name: category.name }))}
    />
  );
}
