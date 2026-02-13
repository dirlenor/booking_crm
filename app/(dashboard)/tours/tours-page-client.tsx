"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TourStatus = "draft" | "pending_review" | "published" | "archived" | "deleted";

export interface TourListItem {
  id: string;
  name: string;
  destination: string;
  duration_days: number;
  status: TourStatus;
  created_at: string;
  min_pax: number;
  max_pax: number | null;
  featured_image_url: string | null;
  package_previews: Array<{
    name: string;
    price_from: number | null;
    price_to: number | null;
  }>;
  price_min: number | null;
  price_max: number | null;
}

interface ToursApiResponse {
  success: boolean;
  data?: {
    items: TourListItem[];
    pagination: { page: number; limit: number; count: number; totalPages: number };
  };
  error?: { message: string };
}

interface ToursPageClientProps {
  initialTours: TourListItem[];
}

function statusBadgeClass(status: TourStatus): string {
  if (status === "published") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (status === "pending_review") return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  if (status === "archived") return "bg-slate-100 text-slate-700 hover:bg-slate-100";
  if (status === "deleted") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-blue-100 text-blue-700 hover:bg-blue-100";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("th-TH");
}

function formatTHB(amount: number): string {
  return `THB ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function ToursPageClient({ initialTours }: ToursPageClientProps) {
  const router = useRouter();
  const [tours, setTours] = useState<TourListItem[]>(initialTours);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TourStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    destination: "",
    duration_days: "1",
    min_pax: "1",
    max_pax: "20",
  });

  const fallbackCover =
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

  const loadTours = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "100");
    if (search.trim()) params.set("search", search.trim());
    if (status !== "all") params.set("status", status);

    try {
      const res = await fetch(`/api/v1/tours?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as ToursApiResponse;
      if (!res.ok || !json.success || !json.data) {
        setError(json.error?.message ?? "Failed to load tours");
        setTours([]);
      } else {
        setTours((prev) => {
          const prevById = new Map(prev.map((tour) => [tour.id, tour]));
          return json.data!.items.map((tour) => {
            const existing = prevById.get(tour.id);
            return {
              ...tour,
              featured_image_url: existing?.featured_image_url ?? null,
              package_previews: existing?.package_previews ?? [],
              price_min: existing?.price_min ?? null,
              price_max: existing?.price_max ?? null,
            };
          });
        });
      }
    } catch {
      setError("Failed to load tours");
      setTours([]);
    }
    setLoading(false);
  };

  const filteredCount = useMemo(() => tours.length, [tours]);

  const resetForm = () => {
    setForm({
      name: "",
      destination: "",
      duration_days: "1",
      min_pax: "1",
      max_pax: "20",
    });
    setFormError(null);
  };

  const handleCreateTour = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        destination: form.destination,
        duration_days: Number(form.duration_days),
        min_pax: Number(form.min_pax),
        max_pax: Number(form.max_pax),
      };

      const res = await fetch("/api/v1/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };

      if (!res.ok || !json.success) {
        setFormError(json.error?.message ?? "Create failed");
      } else {
        setCreateOpen(false);
        resetForm();
        await loadTours();
      }
    } catch {
      setFormError("Create failed");
    }
    setSaving(false);
  };

  const handleSoftDelete = async (id: string) => {
    const confirmed = window.confirm("Move this tour to trash?");
    if (!confirmed) return;
    const res = await fetch(`/api/v1/tours/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    await loadTours();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Tours</h1>
          <p className="text-muted-foreground">Manage tours, schedules, ticket types, and pricing.</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Tour
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              placeholder="Search by name or destination"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "all" | TourStatus)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <Button variant="outline" onClick={loadTours}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-5">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading tours...</div>
          ) : error ? (
            <div className="text-center text-destructive py-12">{error}</div>
          ) : filteredCount === 0 ? (
            <div className="text-center text-muted-foreground py-12">No tours found</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tours.map((tour) => {
                return (
                  <article
                    key={tour.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/tours/${tour.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/tours/${tour.id}`);
                      }
                    }}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-primary/35 hover:shadow-md cursor-pointer md:h-40"
                  >
                    <div className="grid h-full md:grid-cols-[180px_1fr]">
                      <div className="relative h-36 md:h-full">
                        <img
                          src={tour.featured_image_url || fallbackCover}
                          alt={tour.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex h-full flex-col justify-between gap-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <h3 className="text-xl font-bold text-foreground leading-tight truncate">{tour.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="truncate">{tour.destination}</span>
                            </div>
                          </div>
                          <Badge className={statusBadgeClass(tour.status)}>{tour.status.replace("_", " ")}</Badge>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span>{tour.duration_days} day(s)</span>
                            <span>•</span>
                            <span>{tour.min_pax} - {tour.max_pax ?? "-"} pax</span>
                          </div>
                          <p className="font-semibold text-primary">
                            {tour.price_min && tour.price_max
                              ? tour.price_min === tour.price_max
                                ? formatTHB(tour.price_min)
                                : `${formatTHB(tour.price_min)} - ${formatTHB(tour.price_max)}`
                              : "-"}
                          </p>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive"
                            aria-label="Delete tour"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSoftDelete(tour.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tour</DialogTitle>
            <DialogDescription>Fill basic information. You can add schedules, tickets, and pricing in the detail page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tour Name</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Bangkok Temple Tour" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Destination</label>
              <Input value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} placeholder="Bangkok" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Days</label>
                <Input type="number" min="1" value={form.duration_days} onChange={(e) => setForm((p) => ({ ...p, duration_days: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Min Pax</label>
                <Input type="number" min="1" value={form.min_pax} onChange={(e) => setForm((p) => ({ ...p, min_pax: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Pax</label>
                <Input type="number" min="1" value={form.max_pax} onChange={(e) => setForm((p) => ({ ...p, max_pax: e.target.value }))} />
              </div>
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreateTour} disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
