import type { Metadata } from "next"
import { Sidebar } from "@/components/features/dashboard/sidebar"

export const metadata: Metadata = {
  title: "Dashboard | 6CAT Booking CRM",
  description: "Manage your tour bookings efficiently.",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-0 md:pl-64 transition-[padding]">
        <div className="w-full p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
