import TicketsPageClient, { type TicketItem, type TourOption } from "./tickets-page-client"
import { getTicketTypes } from "@/lib/supabase/ticket-types"
import { getTours } from "@/lib/supabase/tours"

export default async function TicketsPage() {
  const [ticketRes, tourRes] = await Promise.all([
    getTicketTypes({ page: 1, limit: 500 }),
    getTours({ page: 1, limit: 300 }),
  ])

  const initialTickets: TicketItem[] = (ticketRes.data ?? []).map((item) => ({
    id: item.id,
    tour_id: item.tour_id,
    name: item.name,
    code: item.code,
    min_age: item.min_age,
    max_age: item.max_age,
    is_active: item.is_active,
    sort_order: item.sort_order,
  }))

  const tours: TourOption[] = (tourRes.data ?? []).map((tour) => ({
    id: tour.id,
    name: tour.name,
    status: tour.status,
  }))

  return <TicketsPageClient initialTickets={initialTickets} tours={tours} />
}
