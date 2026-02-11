"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPackage, upsertPackageItinerary } from "@/lib/supabase/packages";
import { PackageOptionsEditor } from "@/components/features/packages/price-options/package-options-editor";
import { PackageImagesUploader } from "@/components/features/packages/package-images-uploader";
import { ItineraryEditor, type PackageItineraryItem } from "@/components/features/packages/itinerary/itinerary-editor";
import type { PackageOption } from "@/types/package-options";
import type { PackageInsert, PackageStatus, PackageCategory } from "@/types/database";

export default function CreatePackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "images" | "options" | "itinerary">("details");
  const [draftUploadId] = useState(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  });
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [itineraryItems, setItineraryItems] = useState<PackageItineraryItem[]>([]);
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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    const payload: PackageInsert = {
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

    const packageRes = await createPackage(payload);

    if (packageRes.error || !packageRes.data) {
      setErrorMessage(packageRes.error ?? "Failed to create package.");
      setLoading(false);
      return;
    }

    const cleanItinerary = itineraryItems
      .map((item, idx) => ({
        package_id: packageRes.data!.id,
        day_number: Math.max(1, Number(item.day_number || 1)),
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
        sort_order: idx,
      }))
      .filter((item) => item.title.length > 0 || item.description.length > 0);

    if (cleanItinerary.length > 0) {
      const itineraryRes = await upsertPackageItinerary(packageRes.data!.id, cleanItinerary);
      if (itineraryRes.error) {
        setErrorMessage(`Package created, but itinerary save failed: ${itineraryRes.error}`);
        setLoading(false);
        return;
      }
    }

    router.push(`/packages/${packageRes.data.id}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Link href="/packages" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create Package</h1>
        <p className="text-muted-foreground">Add a new tour package to the catalog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

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
            </div>

            {activeTab === "details" && (
              <>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              </>
            )}

            {activeTab === "images" && (
              <div className="grid gap-4">
                <PackageImagesUploader
                  value={formData.imageUrls}
                  action={(next) => setFormData({ ...formData, imageUrls: next })}
                  storagePathPrefix={`packages/draft/${draftUploadId}`}
                  maxImages={6}
                />
                <div className="text-xs text-muted-foreground">
                  Tip: รูปแรกจะถูกใช้เป็น cover image ของแพ็กเกจ
                </div>
              </div>
            )}

            {activeTab === "options" && (
              <div className="pt-2">
                <PackageOptionsEditor value={packageOptions} onChange={setPackageOptions} />
              </div>
            )}

            {activeTab === "itinerary" && (
              <div className="pt-2">
                <ItineraryEditor value={itineraryItems} onChange={setItineraryItems} />
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/packages")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Package"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
