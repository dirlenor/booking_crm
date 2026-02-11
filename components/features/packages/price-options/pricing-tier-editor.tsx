"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/types/package-options";
import { PricingTierRow } from "./pricing-tier-row";

interface PricingTierEditorProps {
  tiers: PricingTier[];
  isFlatRate: boolean;
  flatRatePrice?: number;
  onChange: (tiers: PricingTier[]) => void;
  onFlatRateChange: (isFlat: boolean) => void;
  onFlatRatePriceChange: (price: number) => void;
}

export function PricingTierEditor({
  tiers,
  isFlatRate,
  flatRatePrice = 0,
  onChange,
  onFlatRateChange,
  onFlatRatePriceChange,
}: PricingTierEditorProps) {
  const safeTiers = Array.isArray(tiers) ? tiers : [];
  // Validation Logic
  const errors = useMemo(() => {
    const newErrors: Record<string, string> = {};
    if (isFlatRate) return newErrors;

    const sortedTiers = [...safeTiers].sort((a, b) => a.minPax - b.minPax);
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const current = sortedTiers[i];
      const prev = i > 0 ? sortedTiers[i - 1] : null;

      // Check min/max validity
      if (current.maxPax !== null && current.minPax > current.maxPax) {
        newErrors[current.id] = "Min pax cannot be greater than Max pax";
      }

      // Check overlap with previous
      if (prev && prev.maxPax !== null && current.minPax <= prev.maxPax) {
        newErrors[current.id] = `Overlaps with previous tier (Max: ${prev.maxPax})`;
      }
      
      // Check gaps (optional, but good for UX)
      if (prev && prev.maxPax !== null && current.minPax > prev.maxPax + 1) {
         // Not an error, but maybe a warning? skipping for now to keep it simple
      }
    }
    return newErrors;
  }, [tiers, isFlatRate]);

  const handleTierChange = (id: string, field: keyof PricingTier, value: number | null) => {
    const newTiers = safeTiers.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onChange(newTiers);
  };

  const handleAddTier = () => {
    // Smart auto-fill
    let nextMinPax = 1;
    if (safeTiers.length > 0) {
      const lastTier = safeTiers[safeTiers.length - 1];
      if (lastTier.maxPax !== null) {
        nextMinPax = lastTier.maxPax + 1;
      } else {
        // If last tier is infinite, we can't really add a new one after it logically without changing it
        // But for UI, we'll just set it to last min + 10 or something
        nextMinPax = lastTier.minPax + 10;
      }
    }

    const newTier: PricingTier = {
      id: crypto.randomUUID(),
      minPax: nextMinPax,
      maxPax: null,
      pricePerPerson: 0
    };
    onChange([...safeTiers, newTier]);
  };

  const handleDeleteTier = (id: string) => {
    onChange(safeTiers.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Pricing Model</span>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onFlatRateChange(true)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              isFlatRate 
                ? "bg-white text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Flat Rate
          </button>
          <button
            type="button"
            onClick={() => onFlatRateChange(false)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              !isFlatRate 
                ? "bg-white text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tiered Pricing
          </button>
        </div>
      </div>

      {isFlatRate ? (
        <div className="p-4 border rounded-lg bg-white/50 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Price per person (Flat Rate)
          </label>
          <div className="relative max-w-xs">
            <Input
              type="number"
              min={0}
              value={flatRatePrice}
              onChange={(e) => onFlatRatePriceChange(parseFloat(e.target.value) || 0)}
              className="pl-8"
            />
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">฿</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This price applies to all bookings regardless of group size.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <div className="col-span-3">Min Pax</div>
            <div className="col-span-1"></div>
            <div className="col-span-3">Max Pax</div>
            <div className="col-span-4">Price/Person</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-1">
            {safeTiers.map((tier) => (
              <PricingTierRow
                key={tier.id}
                tier={tier}
                onChange={handleTierChange}
                onDelete={handleDeleteTier}
                error={errors[tier.id]}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTier}
            className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing Tier
          </Button>

          {safeTiers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
              No pricing tiers defined. Add one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
