"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { getBackofficeRole, type BackofficeRole } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Plane,
  Settings,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: CalendarCheck, label: "Bookings", href: "/bookings" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
]

const productItems = [
  { icon: Plane, label: "Tours", href: "/tours" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [role, setRole] = useState<BackofficeRole | null>(null)
  const [roleReady, setRoleReady] = useState(false)
  const isProductPath = pathname === "/products" || pathname.startsWith("/tours") || pathname.startsWith("/tickets")
  const [productOpen, setProductOpen] = useState(false)
  const showProductChildren = isProductPath || productOpen

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const user = data.user
      setUserEmail(user?.email ?? null)
      const fullName = user?.user_metadata?.full_name
      setUserName(typeof fullName === "string" ? fullName : null)
      setRole(getBackofficeRole(user ?? null))
      setRoleReady(true)
    }

    loadUser()

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const editorOnly = role === 'editor'

  const initials = useMemo(() => {
    if (userName) {
      return userName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    }
    if (userEmail) return userEmail.slice(0, 2).toUpperCase()
    return "--"
  }, [userEmail, userName])

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("6cat-post-logout-home", "1")
    }
    await supabase.auth.signOut()
    router.replace("/")
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar pb-4 text-sidebar-foreground hidden md:flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            6C
          </div>
          <span>Booking CRM</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {!roleReady ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-9 rounded-md bg-sidebar-accent/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <nav className="space-y-1">
            {!editorOnly ? (
              <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" isActive={pathname === "/dashboard"} />
            ) : null}
            {!editorOnly ? (
              <SidebarItem icon={Users} label="Customers" href="/customers" isActive={pathname.startsWith("/customers")} />
            ) : null}

            <button
              type="button"
              onClick={() => setProductOpen((prev) => !prev)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isProductPath
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Package className={cn("size-5", isProductPath ? "text-sidebar-primary" : "text-muted-foreground")} />
                Products
              </span>
              {showProductChildren ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>

            {showProductChildren ? (
              <div className="ml-4 border-l border-sidebar-border pl-2 space-y-1">
                <SidebarItem icon={Package} label="Overview" href="/products" isActive={pathname === "/products"} compact />
                {productItems.map((item) => (
                  <SidebarItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} compact />
                ))}
              </div>
            ) : null}

            {!editorOnly ? sidebarItems.slice(2).map((item) => (
              <SidebarItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
            )) : null}
          </nav>
        )}
      </div>

      <div className="border-t border-sidebar-border p-4 space-y-4">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/40 px-3 py-2">
          <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground truncate">
              {roleReady ? (userName || userEmail || "Not signed in") : "Loading account..."}
            </p>
          </div>
        </div>
        <nav className="space-y-1">
          {!editorOnly ? (
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Settings className="size-4" />
              Settings
            </Link>
          ) : null}
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-destructive hover:text-destructive transition-colors text-left"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  isActive,
  compact = false,
}: {
  icon: LucideIcon
  label: string
  href: string
  isActive: boolean
  compact?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
        compact ? "px-2 py-1.5" : "px-3 py-2",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
          : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-muted-foreground"
      )}
    >
      <Icon className={cn(compact ? "size-4" : "size-5", isActive ? "text-sidebar-primary" : "text-muted-foreground")} />
      {label}
    </Link>
  )
}
