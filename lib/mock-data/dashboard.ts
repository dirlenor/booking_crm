export interface Booking {
  id: string
  customerName: string
  packageName: string
  date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  amount: number
}

export interface Trip {
  id: string
  name: string
  date: string
  participants: number
  maxParticipants: number
  guide: string
}

export interface SummaryStat {
  label: string
  value: string
  trend: number // Percentage change
  trendLabel: string // "vs last month"
  icon: "users" | "credit-card" | "calendar" | "activity"
}

export const summaryStats: SummaryStat[] = [
  {
    label: "Total Revenue",
    value: "฿1,245,000",
    trend: 12,
    trendLabel: "vs last month",
    icon: "credit-card",
  },
  {
    label: "Active Bookings",
    value: "45",
    trend: 8,
    trendLabel: "vs last month",
    icon: "calendar",
  },
  {
    label: "New Customers",
    value: "128",
    trend: 24,
    trendLabel: "vs last month",
    icon: "users",
  },
  {
    label: "Tour Occupancy",
    value: "84%",
    trend: -2,
    trendLabel: "vs last month",
    icon: "activity",
  },
]

export const recentBookings: Booking[] = [
  {
    id: "BK-7829",
    customerName: "Alice Freeman",
    packageName: "Bangkok Midnight Food Tour",
    date: "2024-03-15",
    status: "confirmed",
    amount: 2500,
  },
  {
    id: "BK-7830",
    customerName: "Robert Fox",
    packageName: "Ayutthaya Historical Park",
    date: "2024-03-16",
    status: "pending",
    amount: 3200,
  },
  {
    id: "BK-7831",
    customerName: "Darlene Robertson",
    packageName: "Floating Market Private Boat",
    date: "2024-03-18",
    status: "confirmed",
    amount: 4500,
  },
  {
    id: "BK-7832",
    customerName: "Cody Fisher",
    packageName: "Grand Palace Walking Tour",
    date: "2024-03-19",
    status: "cancelled",
    amount: 1800,
  },
  {
    id: "BK-7833",
    customerName: "Theresa Webb",
    packageName: "Elephant Sanctuary Visit",
    date: "2024-03-20",
    status: "completed",
    amount: 5500,
  },
]

export const upcomingTrips: Trip[] = [
  {
    id: "TR-001",
    name: "Bangkok Midnight Food Tour",
    date: "Mar 10, 18:00",
    participants: 8,
    maxParticipants: 10,
    guide: "Somsak C.",
  },
  {
    id: "TR-002",
    name: "Ayutthaya Historical Park",
    date: "Mar 11, 08:00",
    participants: 12,
    maxParticipants: 15,
    guide: "Naree P.",
  },
  {
    id: "TR-003",
    name: "Floating Market Private Boat",
    date: "Mar 18, 07:30",
    participants: 4,
    maxParticipants: 6,
    guide: "Chai W.",
  },
]
