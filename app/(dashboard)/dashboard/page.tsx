"use client"

import { useEffect, useState } from "react"
import { SummaryCard } from "@/components/features/dashboard/summary-card"
import { RecentBookings } from "@/components/features/dashboard/recent-bookings"
import { UpcomingTrips } from "@/components/features/dashboard/upcoming-trips"
import { QuickActions } from "@/components/features/dashboard/quick-actions"
import type { SummaryStat, Booking, Trip } from "@/lib/mock-data/dashboard"
import { getDashboardStats, getRecentBookings, getUpcomingTrips } from "@/lib/supabase/dashboard"
import type { BookingWithRelations, TripWithPackage } from "@/types/database"

function mapBookingToUI(b: BookingWithRelations): Booking {
  return {
    id: b.booking_ref || b.id,
    customerName: b.customers?.name || "Unknown",
    packageName: b.trips?.packages?.name || "Unknown",
    date: b.booking_date ? new Date(b.booking_date).toISOString().split("T")[0] : "",
    status: b.status,
    amount: Number(b.total_amount) || 0,
  }
}

function mapTripToUI(t: TripWithPackage): Trip {
  const tripDate = new Date(t.date)
  const dateStr = tripDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const timeStr = t.time ? String(t.time).substring(0, 5) : ""

  return {
    id: t.id,
    name: t.packages?.name || "Unknown",
    date: timeStr ? `${dateStr}, ${timeStr}` : dateStr,
    participants: 0,
    maxParticipants: t.max_participants || 0,
    guide: t.guide_name || "Unassigned",
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SummaryStat[]>([])
  const [recentBookingsData, setRecentBookingsData] = useState<Booking[]>([])
  const [upcomingTripsData, setUpcomingTripsData] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes, tripsRes] = await Promise.all([
          getDashboardStats(),
          getRecentBookings(5),
          getUpcomingTrips(5),
        ])

        if (statsRes.error) throw new Error(statsRes.error)
        if (bookingsRes.error) throw new Error(bookingsRes.error)
        if (tripsRes.error) throw new Error(tripsRes.error)

        const s = statsRes.data!
        setStats([
          {
            label: "Total Revenue",
            value: `฿${s.totalRevenue.toLocaleString()}`,
            trend: 12,
            trendLabel: "vs last month",
            icon: "credit-card",
          },
          {
            label: "Active Bookings",
            value: s.totalBookings.toString(),
            trend: 8,
            trendLabel: "vs last month",
            icon: "calendar",
          },
          {
            label: "New Customers",
            value: s.totalCustomers.toString(),
            trend: 24,
            trendLabel: "vs last month",
            icon: "users",
          },
          {
            label: "Upcoming Trips",
            value: s.upcomingTrips.toString(),
            trend: -2,
            trendLabel: "vs last month",
            icon: "activity",
          },
        ])

        setRecentBookingsData((bookingsRes.data ?? []).map(mapBookingToUI))
        setUpcomingTripsData((tripsRes.data ?? []).map(mapTripToUI))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("Error fetching dashboard data:", message)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 h-96 bg-gray-200 rounded-xl"></div>
          <div className="space-y-4 lg:col-span-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading dashboard: {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your tours today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-12">
        <RecentBookings bookings={recentBookingsData} />
        <div className="space-y-4 lg:col-span-4">
          <QuickActions />
          <UpcomingTrips trips={upcomingTripsData} />
        </div>
      </div>
    </div>
  )
}
