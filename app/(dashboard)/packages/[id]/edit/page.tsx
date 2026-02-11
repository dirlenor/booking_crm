"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { getPackageById, getPackageItinerary, updatePackage, upsertPackageItinerary } from "@/lib/supabase/packages";
import { PackageOptionsEditor } from "@/components/features/packages/price-options/package-options-editor";
import { TripScheduleEditor } from "@/components/features/packages/trips/trip-schedule-editor";
import { PackageImagesUploader } from "@/components/features/packages/package-images-uploader";
import { ItineraryEditor, type PackageItineraryItem } from "@/components/features/packages/itinerary/itinerary-editor";
import ProductBackofficeLayout, { FormCard, FormField } from "@/components/features/products/product-backoffice-layout";
import type { PackageOption } from "@/types/package-options";
import type { PackageUpdate, PackageStatus, PackageCategory } from "@/types/database";
import { FileText, Route, Settings, Info, Image, Calendar } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("details");
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

  // Load package data
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

      setFormData({
        name: data.name ?? "",
        description: data.description ?? "",
        destination: data.destination ?? "",
        durationDays: dayMatch?.[1] ?? "",
        durationNights: nightMatch?.[1] ?? "",
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
        setPackageOptions(data.options as PackageOption[]);
      } else {
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

  // Handle form submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      setErrorMessage(`Product saved, but itinerary sync failed: ${itineraryRes.error}`);
      setLoading(false);
      return;
    }

    // Sync trips logic
    const optionTimes = collectUniqueOptionTimes(packageOptions);
    if (optionTimes.length > 0) {
      const { data: existingTrips, error: tripError } = await supabase
        .from("trips")
        .select("id, date, time, status, max_participants")
        .eq("package_id", packageId);

      if (tripError) {
        setErrorMessage(`Product saved, but sync trips failed: ${tripError.message}`);
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
            setErrorMessage(`Product saved, but removing outdated trip slots failed: ${deleteError.message}`);
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
            setErrorMessage(`Product saved, but creating synced trips failed: ${createError.message}`);
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
          setErrorMessage(`Product saved, but syncing max participants failed: ${updateMaxError.message}`);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/packages");
    router.refresh();
  };

  // Tabs configuration
  const tabs = [
    { id: "details", label: "Details", icon: <FileText className="size-4" /> },
    { id: "images", label: "Images", icon: <Image className="size-4" /> },
    { id: "options", label: "Options", icon: <Settings className="size-4" /> },
    { id: "itinerary", label: "Itinerary", icon: <Route className="size-4" /> },
    { id: "trips", label: "Trips", icon: <Calendar className="size-4" /> },
  ];

  // Checklist items (simplified - could be dynamic based on completion)
  const checklistItems = [
    { id: "1", label: "Product name", completed: formData.name.length > 0, required: true },
    { id: "2", label: "Description", completed: formData.description.length > 0, required: true },
    { id: "3", label: "Product images (min 1)", completed: formData.imageUrls.length > 0, required: true },
    { id: "4", label: "Pricing options", completed: packageOptions.length > 0, required: true },
    { id: "5", label: "Itinerary details", completed: itineraryItems.length > 0, required: false },
    { id: "6", label: "Trip schedule", completed: true, required: false },
  ];

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / checklistItems.length) * 100);

  // Mock activity groups for sidebar (could fetch real data)
  const activityGroups = [
    {
      id: "current",
      name: "Current Activity",
      packages: [
        {
          id: packageId,
          name: formData.name || "Loading...",
          status: formData.status as "published" | "draft" | "archived",
          type: "package" as const,
        },
      ],
    },
  ];

  const statusVariant = formData.status === "published" ? "success" : formData.status === "draft" ? "warning" : "default";

  return (
    <form onSubmit={handleSubmit}>
      <ProductBackofficeLayout
        title={`${packageId}-${formData.name || "Loading..."}`}
        subtitle={`ID: ${packageId}`}
        status={{ label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1), variant: statusVariant }}
        primaryAction={{
          label: loading ? "Saving..." : "Save Changes",
          onClick: () => handleSubmit(),
          variant: "default",
        }}
        secondaryActions={[
          {
            label: "Cancel",
            onClick: () => router.push("/packages"),
          },
        ]}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activityGroups={activityGroups}
        selectedPackageId={packageId}
        showChecklist={true}
        checklistItems={checklistItems}
        checklistProgress={progress}
      >
        {errorMessage && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* TAB: Details */}
        {activeTab === "details" && (
          <div className="max-w-3xl space-y-6">
            <FormCard title="Basic Information">
              <div className="space-y-4">
                <FormField label="Product name" required>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </FormField>

                <FormField label="Description" required>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Enter product description"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Destination">
                    <Input
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., Bangkok, Thailand"
                    />
                  </FormField>

                  <FormField label="Duration">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                        placeholder="Days"
                      />
                      <Input
                        type="number"
                        min="0"
                        max={formData.durationDays || undefined}
                        value={formData.durationNights}
                        onChange={(e) => setFormData({ ...formData, durationNights: e.target.value })}
                        placeholder="Nights"
                      />
                    </div>
                    {nightsExceedDays && (
                      <p className="text-xs text-red-500 mt-1">Nights must not exceed days.</p>
                    )}
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Base Price (THB)" required>
                    <Input
                      type="number"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="2500"
                    />
                  </FormField>

                  <FormField label="Max Pax" required>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxPax}
                      onChange={(e) => setFormData({ ...formData, maxPax: e.target.value })}
                      placeholder="20"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Status">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </FormField>

                  <FormField label="Category">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="Adventure">Adventure</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Relaxation">Relaxation</option>
                      <option value="City">City</option>
                      <option value="Nature">Nature</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Highlights">
                  <Input
                    value={formData.highlights}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    placeholder="Canal Cruise, Floating Market, Temple Visit"
                  />
                </FormField>
              </div>
            </FormCard>
          </div>
        )}

        {/* TAB: Images */}
        {activeTab === "images" && (
          <div className="max-w-3xl">
            <FormCard title="Product Images">
              <div className="space-y-4">
                <PackageImagesUploader
                  value={formData.imageUrls}
                  action={(next) => setFormData({ ...formData, imageUrls: next })}
                  storagePathPrefix={`packages/${packageId}`}
                  maxImages={6}
                />
                <p className="text-sm text-gray-500">First image will be used as cover image.</p>
              </div>
            </FormCard>
          </div>
        )}

        {/* TAB: Options */}
        {activeTab === "options" && (
          <div className="max-w-3xl">
            <FormCard title="Pricing Options">
              <PackageOptionsEditor value={packageOptions} onChange={setPackageOptions} />
            </FormCard>
          </div>
        )}

        {/* TAB: Itinerary */}
        {activeTab === "itinerary" && (
          <div className="max-w-3xl">
            <FormCard title="Daily Itinerary">
              <ItineraryEditor value={itineraryItems} onChange={setItineraryItems} />
            </FormCard>
          </div>
        )}

        {/* TAB: Trips */}
        {activeTab === "trips" && (
          <div className="max-w-3xl">
            <FormCard title="Trip Schedule">
              <TripScheduleEditor packageId={packageId} onDatesChange={setTripDates} />
            </FormCard>
          </div>
        )}
      </ProductBackofficeLayout>
    </form>
  );
}
