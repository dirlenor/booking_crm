"use client";

import { useEffect, useState, type ReactNode } from "react";
import type React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TourPackage } from "@/lib/mock-data/packages";
import { cn } from "@/lib/utils";
import { PackageOptionsEditor } from "./price-options/package-options-editor";
import type { PackageOption } from "@/types/package-options";

function SimpleLabel({ children, htmlFor, className }: { children: ReactNode, htmlFor?: string, className?: string }) {
  return <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>{children}</label>;
}

interface PackageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TourPackage | null;
  onSuccess?: () => void;
}

export function PackageFormModal({ open, onOpenChange, initialData, onSuccess }: PackageFormModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    destination: "",
    duration: "",
    status: "draft",
    category: "Cultural",
    image_url: "",
    highlights: ""
  });

  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description,
          destination: initialData.destination,
          duration: initialData.duration,
          status: initialData.status,
          category: initialData.category ?? "Cultural",
          image_url: initialData.imageUrl,
          highlights: initialData.highlights.join(", ")
        });
      } else {
        setFormData({
          name: "",
          description: "",
          destination: "",
          duration: "",
          status: "draft",
          category: "Cultural",
          image_url: "",
          highlights: ""
        });
      }
      if (initialData) {
        const loadOptions = async () => {
          const { data } = await supabase
            .from("packages")
            .select("options")
            .eq("id", initialData.id)
            .maybeSingle();

          if (Array.isArray(data?.options)) {
            setPackageOptions(data.options as PackageOption[]);
          } else {
            setPackageOptions([]);
          }
        };

        loadOptions().catch(() => setPackageOptions([]));
      } else {
        setPackageOptions([]);
      }
      setError(null);
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const highlightsArray = formData.highlights.split(",").map(s => s.trim()).filter(Boolean);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        destination: formData.destination,
        duration: formData.duration,
        status: formData.status,
        category: formData.category,
        image_url: formData.image_url,
        highlights: highlightsArray,
        options: packageOptions
      };

      if (initialData) {
        const { error: updateError } = await supabase
          .from("packages")
          .update(payload)
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("packages")
          .insert([payload]);

        if (insertError) throw insertError;
      }

      onOpenChange(false);
      router.refresh();
      if (onSuccess) onSuccess();

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Package" : "Create Package"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details of the tour package." : "Add a new tour package to the catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleLabel htmlFor="name">Name</SimpleLabel>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <SimpleLabel htmlFor="destination">Destination</SimpleLabel>
              <Input id="destination" name="destination" value={formData.destination} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <SimpleLabel htmlFor="duration">Duration (e.g. "3 Days")</SimpleLabel>
              <Input id="duration" name="duration" value={formData.duration} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <SimpleLabel htmlFor="category">Category</SimpleLabel>
              <select 
                id="category" 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Cultural">Cultural</option>
                <option value="Adventure">Adventure</option>
                <option value="Relaxation">Relaxation</option>
                <option value="City">City</option>
              </select>
            </div>

            <div className="space-y-2">
              <SimpleLabel htmlFor="status">Status</SimpleLabel>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <SimpleLabel htmlFor="image_url">Image URL</SimpleLabel>
            <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <SimpleLabel htmlFor="description">Description</SimpleLabel>
            <textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2">
            <SimpleLabel htmlFor="highlights">Highlights (comma separated)</SimpleLabel>
            <Input id="highlights" name="highlights" value={formData.highlights} onChange={handleChange} placeholder="Temple visit, Boat ride, Sunset dinner" />
          </div>

          <div className="pt-4 border-t">
            <PackageOptionsEditor 
              value={packageOptions} 
              onChange={setPackageOptions} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Package"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
