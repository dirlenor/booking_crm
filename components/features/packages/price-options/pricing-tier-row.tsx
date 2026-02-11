"use client";

import type React from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/types/package-options";

interface PricingTierRowProps {
  tier: PricingTier;
  onChange: (id: string, field: keyof PricingTier, value: number | null) => void;
  onDelete: (id: string) => void;
  error?: string;
}

export function PricingTierRow({ tier, onChange, onDelete, error }: PricingTierRowProps) {
  const handleMaxPaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || value === "∞") {
      onChange(tier.id, "maxPax", null);
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        onChange(tier.id, "maxPax", num);
      }
    }
  };

  return (
    <div className="group relative">
      <div className={cn(
        "grid grid-cols-12 gap-2 items-start",
        error ? "mb-6" : "mb-2"
      )}>
        <div className="col-span-3">
          <Input
            type="number"
            min={1}
            value={tier.minPax}
            onChange={(e) => onChange(tier.id, "minPax", parseInt(e.target.value) || 0)}
            placeholder="Min"
            className="h-9"
          />
        </div>
        <div className="col-span-1 flex items-center justify-center pt-2 text-muted-foreground">
          -
        </div>
        <div className="col-span-3">
          <Input
            type="text"
            value={tier.maxPax === null ? "∞" : tier.maxPax}
            onChange={handleMaxPaxChange}
            placeholder="Max"
            className="h-9"
          />
        </div>
        <div className="col-span-4 relative">
          <Input
            type="number"
            min={0}
            value={tier.pricePerPerson}
            onChange={(e) => onChange(tier.id, "pricePerPerson", parseFloat(e.target.value) || 0)}
            placeholder="Price"
            className="h-9 pl-6"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">฿</span>
        </div>
        <div className="col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(tier.id)}
            className="h-9 w-9 text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {error && (
        <div className="absolute -bottom-5 left-0 right-0 flex items-center text-xs text-red-500">
          <AlertCircle className="w-3 h-3 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
