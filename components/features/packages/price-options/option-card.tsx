"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Plus, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PackageOption, PricingTier } from "@/types/package-options";
import { PricingTierEditor } from "./pricing-tier-editor";

interface OptionCardProps {
  option: PackageOption;
  onChange: (updatedOption: PackageOption) => void;
  onRemove: () => void;
  defaultExpanded?: boolean;
}

export function OptionCard({ 
  option, 
  onChange, 
  onRemove, 
  defaultExpanded = false 
}: OptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSaved, setIsSaved] = useState(false);

  const handleFieldChange = (field: keyof PackageOption, value: any) => {
    setIsSaved(false);
    onChange({ ...option, [field]: value });
  };

  const handleTiersChange = (tiers: PricingTier[]) => {
    setIsSaved(false);
    onChange({ ...option, pricingTiers: tiers });
  };

  const times = Array.isArray(option.times) ? option.times : [];
  const normalizedTimes = times
    .map((t) => String(t || "").trim().slice(0, 5))
    .filter(Boolean);
  const visibleTimes = normalizedTimes.slice(0, 3);

  const handleAddTime = () => {
    const defaultTimeSlot = "09:00";
    const next = [...times, defaultTimeSlot];
    setIsSaved(false);
    onChange({ ...option, times: next });
  };

  const handleRemoveTime = (index: number) => {
    const next = times.filter((_, i) => i !== index);
    setIsSaved(false);
    onChange({ ...option, times: next });
  };

  const handleTimeChange = (index: number, value: string) => {
    const next = times.map((t, i) => (i === index ? value : t));
    setIsSaved(false);
    onChange({ ...option, times: next });
  };

  const handleSave = () => {
    setIsSaved(true);
    setIsExpanded(false);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      isExpanded ? "shadow-md" : "hover:shadow"
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
            isExpanded ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <div className="flex flex-col min-w-0">
            <h3 className="font-medium text-sm truncate">
              {option.name || "Unnamed Option"}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Quota: {option.quota}
              </span>
              <span>•</span>
              <span>
                {option.isFlatRate 
                  ? `Flat Rate: ฿${option.flatRatePrice?.toLocaleString() ?? 0}` 
                  : `${option.pricingTiers?.length ?? 0} Tiers`
                }
              </span>
              <span>•</span>
              <span>
                {normalizedTimes.length > 0
                  ? `Times: ${visibleTimes.join(", ")}${normalizedTimes.length > visibleTimes.length ? ` +${normalizedTimes.length - visibleTimes.length}` : ""}`
                  : "Times: -"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 pl-2">
          {isSaved && (
            <Badge variant="secondary" className="text-xs font-normal bg-emerald-100 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
          {option.quota > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {option.quota} pax
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-8 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Option Name</label>
              <Input
                value={option.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="e.g. Standard Package, VIP Access"
              />
            </div>
            <div className="col-span-1 md:col-span-4 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Total Quota</label>
              <Input
                type="number"
                min={0}
                value={option.quota}
                onChange={(e) => handleFieldChange("quota", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <textarea
              value={option.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="What's included in this option?"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="pt-2 border-t">
            <div className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Time Slots</p>
                  <p className="text-xs text-muted-foreground">
                    Add one or more departure times for this option.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTime}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add time
                </Button>
              </div>

              {times.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                  No time slots yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {times.map((t, idx) => (
                    <div
                      key={`${option.id}-time-${idx}`}
                      className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
                    >
                      <Input
                        type="time"
                        value={t}
                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                        className="h-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTime(idx)}
                        className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        aria-label="Remove time"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <PricingTierEditor
              tiers={option.pricingTiers}
              onChange={handleTiersChange}
              isFlatRate={option.isFlatRate}
              onFlatRateChange={(val) => handleFieldChange("isFlatRate", val)}
              flatRatePrice={option.flatRatePrice}
              onFlatRatePriceChange={(val) => handleFieldChange("flatRatePrice", val)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleSave} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Save Option
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
