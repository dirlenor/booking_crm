"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { getPackageById, getPackageItinerary, updatePackage, upsertPackageItinerary } from "@/lib/supabase/packages";
import { PackageOptionsEditor } from "@/components/features/packages/price-options/package-options-editor";
import { TripScheduleEditor } from "@/components/features/packages/trips/trip-schedule-editor";
import { PackageImagesUploader } from "@/components/features/packages/package-images-uploader";
import { ItineraryEditor, type PackageItineraryItem } from "@/components/features/packages/itinerary/itinerary-editor";
import type { PackageOption } from "@/types/package-options";
import type { PackageUpdate, PackageStatus, PackageCategory } from "@/types/database";

const normalizeTimeSlot = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.slice(0, 5);
};

const collectUniqueOptionTimes = (options: PackageOption[]) => {
  const set = new Set<string>();
  options.forEach((opt) => {
    (opt.times ?? []).forEach((t) => {
      const slot = normalizeTimeSlot(t);
      if (slot) set.add(slot);
    });
  });
  return Array.from(set);
};

export default function EditPackagePage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const packageId = params?.id ?? "";
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "images" | "options" | "itinerary" | "trips">("details");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    destination: "",
    durationDays: "",
    durationNights: "",
    basePrice: "",
    maxPax: "",
    status: "draft",
    category: "Cultural",
    imageUrls: [] as string[],
    highlights: "",
  });
  const durationDays = Number(formData.durationDays || 0);
  const durationNights = Number(formData.durationNights || 0);
  const nightsExceedDays = durationNights > durationDays;
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [itineraryItems, setItineraryItems] = useState<PackageItineraryItem[]>([]);
  const [tripDates, setTripDates] = useState<string[]>([]);

  useEffect(() => {
    const loadPackage = async () => {
      if (!packageId) return;
      setLoading(true);
      setErrorMessage(null);

      const [packageRes, itineraryRes] = await Promise.all([
        getPackageById(packageId),
        getPackageItinerary(packageId),
      ]);

      if (packageRes.error || !packageRes.data) {
        setErrorMessage(packageRes.error ?? "Package not found.");
        setLoading(false);
        return;
      }

      const data = packageRes.data;
      const dayMatch = data.duration?.match(/(\d+)\s*Day/i);
      const nightMatch = data.duration?.match(/(\d+)\s*Night/i);
      const durationDays = dayMatch?.[1] ?? "";
      const durationNights = nightMatch?.[1] ?? "";

      setFormData({
        name: data.name ?? "",
        description: data.description ?? "",
        destination: data.destination ?? "",
        durationDays,
        durationNights,
        basePrice: data.base_price ? String(data.base_price) : "",
        maxPax: data.max_pax ? String(data.max_pax) : "",
        status: data.status ?? "draft",
        category: data.category ?? "Cultural",
        imageUrls:
          Array.isArray(data.image_urls) && data.image_urls.length > 0
            ? data.image_urls.filter((url: unknown) => typeof url === "string" && url.trim().length > 0)
            : data.image_url
              ? [data.image_url]
              : [],
        highlights: Array.isArray(data.highlights) ? data.highlights.join(", ") : "",
      });

      if (Array.isArray(data.options)) {
        console.log('Loaded options:', data.options);
        setPackageOptions(data.options as PackageOption[]);
      } else {
        console.log('No options array in data');
        setPackageOptions([]);
      }

      if (!itineraryRes.error && itineraryRes.data) {
        setItineraryItems(
          itineraryRes.data.map((item) => ({
            id: item.id,
            day_number: Number(item.day_number ?? 1),
            title: String(item.title ?? ""),
            description: String(item.description ?? ""),
          }))
        );
      } else {
        setItineraryItems([]);
      }

      setLoading(false);
    };

    loadPackage();
  }, [packageId]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!packageId) return;
    setLoading(true);
    setErrorMessage(null);

    if (nightsExceedDays) {
      setErrorMessage("Nights cannot be greater than days.");
      setLoading(false);
      return;
    }

    const durationLabel = durationDays > 0
      ? `${durationDays} ${durationDays === 1 ? "Day" : "Days"}${durationNights > 0 ? ` ${durationNights} ${durationNights === 1 ? "Night" : "Nights"}` : ""}`
      : "";

    const payload: PackageUpdate = {
      name: formData.name,
      description: formData.description || null,
      destination: formData.destination || null,
      duration: durationLabel || null,
      base_price: Number(formData.basePrice || 0),
      max_pax: Number(formData.maxPax || 0),
      status: formData.status as PackageStatus,
      category: formData.category as PackageCategory,
      image_urls: formData.imageUrls,
      image_url: formData.imageUrls[0] ?? null,
      highlights: formData.highlights
        ? formData.highlights.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
      options: packageOptions,
    };

    const updateRes = await updatePackage(packageId, payload);

    if (updateRes.error) {
      setErrorMessage(updateRes.error);
      setLoading(false);
      return;
    }

    const cleanItinerary = itineraryItems
      .map((item, idx) => ({
        id: item.id,
        package_id: packageId,
        day_number: Math.max(1, Number(item.day_number || 1)),
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
        sort_order: idx,
      }))
      .filter((item) => item.title.length > 0 || item.description.length > 0);

    const itineraryRes = await upsertPackageItinerary(packageId, cleanItinerary);

    if (itineraryRes.error) {
      setErrorMessage(`Package saved, but itinerary sync failed: ${itineraryRes.error}`);
      setLoading(false);
      return;
    }

    const optionTimes = collectUniqueOptionTimes(packageOptions);
    console.log('Submitting. optionTimes:', optionTimes);
    console.log('tripDates state:', tripDates);

    if (optionTimes.length > 0) {
      const { data: existingTrips, error: tripError } = await supabase
        .from("trips")
        .select("id, date, time, status, max_participants")
        .eq("package_id", packageId);

      if (tripError) {
        setErrorMessage(`Package saved, but sync trips failed: ${tripError.message}`);
        setLoading(false);
        return;
      }

      const scheduledDates = Array.from(
        new Set(
          (existingTrips ?? [])
            .filter((trip) => trip.status === "scheduled")
            .map((trip) => trip.date)
            .filter(Boolean)
        )
      );

      const selectedTripDates = Array.from(
        new Set(tripDates.map((date) => String(date || "").trim()).filter(Boolean))
      );

      const datesToUse = selectedTripDates.length > 0 ? selectedTripDates : scheduledDates;

      if (datesToUse.length > 0) {
        const dateSet = new Set(datesToUse);
        const existingKeySet = new Set(
          (existingTrips ?? []).map((trip) => `${trip.date}|${normalizeTimeSlot(trip.time ?? "")}`)
        );

        const targetKeySet = new Set<string>();
        datesToUse.forEach((date) => {
          optionTimes.forEach((time) => {
            targetKeySet.add(`${date}|${time}`);
          });
        });

        const toDeleteIds = (existingTrips ?? [])
          .filter((trip) => trip.status === "scheduled" && dateSet.has(String(trip.date)))
          .filter((trip) => !targetKeySet.has(`${trip.date}|${normalizeTimeSlot(trip.time ?? "")}`))
          .map((trip) => trip.id)
          .filter(Boolean);

        if (toDeleteIds.length > 0) {
          const { error: deleteError } = await supabase
            .from("trips")
            .delete()
            .in("id", toDeleteIds);

          if (deleteError) {
            setErrorMessage(`Package saved, but removing outdated trip slots failed: ${deleteError.message}`);
            setLoading(false);
            return;
          }
        }

        const maxParticipants = Math.max(1, Number(formData.maxPax || 0));
        const toCreate: Array<{
          package_id: string;
          date: string;
          time: string;
          max_participants: number;
          guide_name: string;
          status: string;
        }> = [];

        datesToUse.forEach((date) => {
          optionTimes.forEach((time) => {
            const key = `${date}|${time}`;
            if (!existingKeySet.has(key)) {
              toCreate.push({
                package_id: packageId,
                date,
                time,
                max_participants: maxParticipants,
                guide_name: "TBD",
                status: "scheduled",
              });
            }
          });
        });

        if (toCreate.length > 0) {
          const { error: createError } = await supabase.from("trips").insert(toCreate);
          if (createError) {
            setErrorMessage(`Package saved, but creating synced trips failed: ${createError.message}`);
            setLoading(false);
            return;
          }
        }

        const { error: updateMaxError } = await supabase
          .from("trips")
          .update({ max_participants: maxParticipants })
          .eq("package_id", packageId)
          .eq("status", "scheduled")
          .in("date", datesToUse);

        if (updateMaxError) {
          setErrorMessage(`Package saved, but syncing max participants failed: ${updateMaxError.message}`);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/packages");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Link href="/packages" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Edit Product{formData.name ? `: ${formData.name}` : ""}
          </h1>
          <p className="text-muted-foreground">Update details and options for this product.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/packages")}>
            Cancel
          </Button>
          <Button type="submit" form="package-edit-form" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Product{formData.name ? ` - ${formData.name}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="package-edit-form" onSubmit={handleSubmit} className="grid gap-6">
            {errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-6">
              <div className="flex flex-wrap items-center gap-2 border-b pb-3">
                <Button
                  type="button"
                  variant={activeTab === "details" ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "images" ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => setActiveTab("images")}
                >
                  Images
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "options" ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => setActiveTab("options")}
                >
                  Options
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "itinerary" ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => setActiveTab("itinerary")}
                >
                  Itinerary
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "trips" ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => setActiveTab("trips")}
                >
                  Trips
                </Button>
              </div>

              {activeTab === "details" && (
                <div className="rounded-xl border border-input bg-background shadow-sm">
                  <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <h2 className="text-base font-semibold text-foreground">Product Details</h2>
                  </div>
                  <div className="border-t border-input px-4 py-5 space-y-6">
                    <div className="grid gap-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        placeholder="Grand Palace & Emerald Buddha Tour"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-sm font-medium">Description</label>
                      <textarea
                        id="description"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={formData.description}
                        onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                        placeholder="Short description of the tour..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="destination" className="text-sm font-medium">Destination</label>
                        <Input
                          id="destination"
                          value={formData.destination}
                          onChange={(event) => setFormData({ ...formData, destination: event.target.value })}
                          placeholder="Bangkok, Thailand"
                        />
                      </div>
                      <div className="grid gap-2">
                    <label className="text-sm font-medium">Duration</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        id="durationDays"
                        type="number"
                        min="0"
                        value={formData.durationDays}
                        onChange={(event) => setFormData({ ...formData, durationDays: event.target.value })}
                        placeholder="Days"
                        className={nightsExceedDays ? "border-destructive" : undefined}
                      />
                      <Input
                        id="durationNights"
                        type="number"
                        min="0"
                        max={formData.durationDays || undefined}
                        value={formData.durationNights}
                        onChange={(event) => setFormData({ ...formData, durationNights: event.target.value })}
                        placeholder="Nights"
                        className={nightsExceedDays ? "border-destructive" : undefined}
                      />
                    </div>
                    <p className={nightsExceedDays ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                      Nights must not exceed days.
                    </p>
                  </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="basePrice" className="text-sm font-medium">Base Price (THB)</label>
                        <Input
                          id="basePrice"
                          type="number"
                          min="0"
                          value={formData.basePrice}
                          onChange={(event) => setFormData({ ...formData, basePrice: event.target.value })}
                          placeholder="2500"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="maxPax" className="text-sm font-medium">Max Pax</label>
                        <Input
                          id="maxPax"
                          type="number"
                          min="1"
                          value={formData.maxPax}
                          onChange={(event) => setFormData({ ...formData, maxPax: event.target.value })}
                          placeholder="20"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="status" className="text-sm font-medium">Status</label>
                        <select
                          id="status"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.status}
                          onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="category" className="text-sm font-medium">Category</label>
                        <select
                          id="category"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.category}
                          onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                        >
                          <option value="Adventure">Adventure</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Relaxation">Relaxation</option>
                          <option value="City">City</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="highlights" className="text-sm font-medium">Highlights</label>
                      <Input
                        id="highlights"
                        value={formData.highlights}
                        onChange={(event) => setFormData({ ...formData, highlights: event.target.value })}
                        placeholder="Temple visit, Local guide, Lunch included"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "images" && (
                <div className="rounded-xl border border-input bg-background shadow-sm">
                  <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <h2 className="text-base font-semibold text-foreground">Product Images</h2>
                    <div className="text-xs text-muted-foreground">Max 6</div>
                  </div>
                  <div className="border-t border-input px-4 py-5">
                    <PackageImagesUploader
                      value={formData.imageUrls}
                      action={(next) => setFormData({ ...formData, imageUrls: next })}
                      storagePathPrefix={`packages/${packageId}`}
                      maxImages={6}
                    />
                    <div className="mt-3 text-xs text-muted-foreground">
                      รูปแรกจะถูกใช้เป็น cover image ของแพ็กเกจ
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "options" && (
                <div className="rounded-xl border border-input bg-background shadow-sm">
                  <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <h2 className="text-base font-semibold text-foreground">Product Options</h2>
                  </div>
                  <div className="border-t border-input px-4 py-5">
                    <PackageOptionsEditor value={packageOptions} onChange={setPackageOptions} showHeading={false} />
                  </div>
                </div>
              )}

              {activeTab === "itinerary" && (
                <div className="rounded-xl border border-input bg-background shadow-sm">
                  <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <h2 className="text-base font-semibold text-foreground">Product Itinerary</h2>
                  </div>
                  <div className="border-t border-input px-4 py-5">
                    <ItineraryEditor value={itineraryItems} onChange={setItineraryItems} />
                  </div>
                </div>
              )}

              {activeTab === "trips" && (
                <div className="rounded-xl border border-input bg-background shadow-sm">
                  <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <h2 className="text-base font-semibold text-foreground">
                      Trip Schedule{formData.name ? ` - ${formData.name}` : ""}
                    </h2>
                  </div>
                  <div className="border-t border-input px-4 py-5">
                    <TripScheduleEditor
                      packageId={packageId}
                      onDatesChange={setTripDates}
                    />
                  </div>
                </div>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
