"use client";

import { useEffect, useState, type ReactNode } from "react";
import type React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Trip } from "@/lib/mock-data/trips";
import { cn } from "@/lib/utils";

function SimpleLabel({ children, htmlFor, className }: { children: ReactNode, htmlFor?: string, className?: string }) {
  return <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>{children}</label>;
}

interface TripFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Trip | null;
  onSuccess?: () => void;
}

export function TripFormModal({ open, onOpenChange, initialData, onSuccess }: TripFormModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<{id: string, name: string}[]>([]);

  const [formData, setFormData] = useState({
    package_id: "",
    date: "",
    time: "",
    max_participants: 0,
    guide_name: "",
    status: "scheduled"
  });

  useEffect(() => {
    const fetchPackages = async () => {
      const { data } = await supabase.from("packages").select("id, name").order("name");
      if (data) {
        setPackages(data);
      }
    };
    
    if (open) {
      fetchPackages();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          package_id: initialData.packageId,
          date: initialData.date,
          time: initialData.time,
          max_participants: initialData.maxParticipants,
          guide_name: initialData.guide,
          status: initialData.status
        });
      } else {
        setFormData({
          package_id: "",
          date: new Date().toISOString().slice(0, 10),
          time: "09:00",
          max_participants: 20,
          guide_name: "",
          status: "scheduled"
        });
      }
      setError(null);
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "max_participants" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.package_id) {
      setError("Please select a package");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        package_id: formData.package_id,
        date: formData.date,
        time: formData.time,
        max_participants: formData.max_participants,
        guide_name: formData.guide_name,
        status: formData.status
      };

      if (initialData) {
        const { error: updateError } = await supabase
          .from("trips")
          .update(payload)
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("trips")
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Trip" : "Schedule New Trip"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update trip details." : "Add a new trip to the calendar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="space-y-2">
            <SimpleLabel htmlFor="package_id">Tour Package</SimpleLabel>
            <select 
              id="package_id" 
              name="package_id" 
              value={formData.package_id} 
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>Select a package</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleLabel htmlFor="date">Date</SimpleLabel>
              <Input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <SimpleLabel htmlFor="time">Time</SimpleLabel>
              <Input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <SimpleLabel htmlFor="guide_name">Guide Name</SimpleLabel>
            <Input id="guide_name" name="guide_name" value={formData.guide_name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleLabel htmlFor="max_participants">Max Participants</SimpleLabel>
              <Input type="number" id="max_participants" name="max_participants" value={formData.max_participants} onChange={handleChange} required min="1" />
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Trip"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
