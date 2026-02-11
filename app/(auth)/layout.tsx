import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - 6CAT Booking CRM",
  description: "Login or register to access 6CAT Booking CRM",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              6C
            </div>
            <h1 className="text-2xl font-bold text-foreground">6CAT Booking CRM</h1>
          </div>
          <p className="text-muted-foreground text-sm">Tour Management System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
