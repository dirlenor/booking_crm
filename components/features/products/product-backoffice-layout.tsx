"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Package,
  Box,
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Map,
  Settings,
  LogOut,
  CheckCircle2,
  Circle,
  AlertCircle,
  MoreHorizontal,
  Plus,
  Search,
  Bell,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// TYPES
// =============================================================================

interface PackageTreeItem {
  id: string;
  name: string;
  status: "published" | "draft" | "archived";
  type: "package";
}

interface ActivityGroup {
  id: string;
  name: string;
  packages: PackageTreeItem[];
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required?: boolean;
}

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface ProductBackofficeLayoutProps {
  children: React.ReactNode;
  // Header
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: "default" | "success" | "warning" | "destructive";
  };
  approvalStatus?: {
    label: string;
    variant: "default" | "success" | "warning" | "destructive";
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive";
  };
  secondaryActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  // Tabs
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  // Sidebar
  activityGroups: ActivityGroup[];
  selectedPackageId?: string;
  onSelectPackage?: (packageId: string) => void;
  // Right Panel
  showChecklist?: boolean;
  checklistItems?: ChecklistItem[];
  checklistProgress?: number;
  onChecklistItemClick?: (itemId: string) => void;
}

export default function ProductBackofficeLayout({
  children,
  title,
  subtitle,
  status,
  approvalStatus,
  primaryAction,
  secondaryActions,
  tabs,
  activeTab,
  onTabChange,
  activityGroups,
  selectedPackageId,
  onSelectPackage,
  showChecklist = true,
  checklistItems = [],
  checklistProgress = 0,
  onChecklistItemClick,
}: ProductBackofficeLayoutProps) {
  const pathname = usePathname();
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(
    () => new Set(activityGroups.map((g) => g.id))
  );
  const [sidebarSearch, setSidebarSearch] = useState("");

  const toggleActivity = (activityId: string) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  };

  const filteredGroups = activityGroups.map((group) => ({
    ...group,
    packages: group.packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(sidebarSearch.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* =============================================================================
          TOP NAVIGATION BAR
          ============================================================================= */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm">
              6C
            </div>
            <span className="hidden lg:inline">Booking CRM</span>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <nav className="hidden md:flex items-center gap-1">
            <TopNavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <TopNavItem href="/customers" icon={Users} label="Customers" />
            <TopNavItem href="/packages" icon={Package} label="Products" active />
            <TopNavItem href="/bookings" icon={CalendarCheck} label="Bookings" />
            <TopNavItem href="/payments" icon={CreditCard} label="Payments" />
            <TopNavItem href="/trips" icon={Map} label="Trips" />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Search className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 relative">
            <Bell className="size-5" />
            <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <HelpCircle className="size-5" />
          </Button>
          <div className="h-6 w-px bg-gray-200 mx-1" />
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <Settings className="size-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* =============================================================================
          MAIN LAYOUT
          ============================================================================= */}
      <div className="pt-16 flex">
        {/* =============================================================================
            LEFT SIDEBAR - Product > Package Tree
            ============================================================================= */}
        <aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-white border-r border-gray-200 overflow-y-auto z-40">
          {/* Activity Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Activity
                </p>
                <h2 className="font-semibold text-gray-900 mt-0.5">
                  Thai Cooking Class in Phuket
                </h2>
              </div>
              <Badge variant="outline" className="text-xs">182092</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <Plus className="size-3.5" />
              Add Package
            </Button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Package ID & title"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Tree Navigation */}
          <div className="py-2">
            {filteredGroups.map((group) => (
              <div key={group.id} className="mb-1">
                {/* Activity Header */}
                <button
                  onClick={() => toggleActivity(group.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {expandedActivities.has(group.id) ? (
                    <ChevronDown className="size-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="size-4 text-gray-400" />
                  )}
                  <Box className="size-4 text-primary" />
                  <span className="truncate">{group.name}</span>
                </button>

                {/* Packages List */}
                {expandedActivities.has(group.id) && (
                  <div className="ml-4">
                    {group.packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => onSelectPackage?.(pkg.id)}
                        className={cn(
                          "w-full flex items-start gap-2 px-4 py-2.5 text-sm transition-colors text-left",
                          selectedPackageId === pkg.id
                            ? "bg-primary/5 text-primary border-l-2 border-primary"
                            : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{pkg.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusDot status={pkg.status} />
                            <span className="text-xs text-gray-400">{pkg.id}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* =============================================================================
            MAIN CONTENT AREA
            ============================================================================= */}
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-64px)] transition-all duration-200",
            showChecklist ? "mr-[320px]" : "",
            "ml-[280px]"
          )}
        >
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  {subtitle && (
                    <Badge variant="secondary" className="text-xs">{subtitle}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {status && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Package status:</span>
                      <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                    </div>
                  )}
                  {approvalStatus && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Approval status:</span>
                      <StatusBadge variant={approvalStatus.variant}>
                        {approvalStatus.label}
                      </StatusBadge>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {secondaryActions?.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={action.onClick}
                    className="gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
                {primaryAction && (
                  <Button
                    size="sm"
                    onClick={primaryAction.onClick}
                    variant={primaryAction.variant || "default"}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <MoreHorizontal className="size-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-6 border-b border-gray-200 -mx-6 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1 text-xs text-gray-400">{tab.badge}</span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </main>

        {/* =============================================================================
            RIGHT PANEL - Completion Checklist
            ============================================================================= */}
        {showChecklist && (
          <aside className="fixed right-0 top-16 bottom-0 w-[320px] bg-white border-l border-gray-200 overflow-y-auto z-40">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">To do list</h3>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Task completion rate: {checklistProgress}%
                </p>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Suggestions</h4>
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChecklistItemClick?.(item.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : item.required ? (
                      <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="size-5 text-gray-300 shrink-0 mt-0.5 group-hover:text-gray-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm",
                          item.completed ? "text-gray-500 line-through" : "text-gray-700"
                        )}
                      >
                        {item.label}
                      </p>
                    </div>
                    {!item.completed && (
                      <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Button */}
            <div className="absolute bottom-4 right-4">
              <Button className="gap-2 rounded-full shadow-lg">
                <HelpCircle className="size-4" />
                Get help
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function TopNavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "text-primary bg-primary/5"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function StatusDot({
  status,
}: {
  status: "published" | "draft" | "archived";
}) {
  const colors = {
    published: "bg-emerald-500",
    draft: "bg-amber-500",
    archived: "bg-gray-400",
  };
  return <span className={cn("size-1.5 rounded-full", colors[status])} />;
}

function StatusBadge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "default" | "success" | "warning" | "destructive";
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    destructive: "bg-red-50 text-red-700",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

// =============================================================================
// FORM CARD COMPONENT
// =============================================================================

export function FormCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-200", className)}>
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// =============================================================================
// FORM SECTION COMPONENT
// =============================================================================

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// =============================================================================
// FORM FIELD COMPONENT
// =============================================================================

export function FormField({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
