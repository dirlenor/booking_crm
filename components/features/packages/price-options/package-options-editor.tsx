"use client";

import { Plus, Package } from "lucide-react";
import type { PackageOption } from "@/types/package-options";
import { OptionCard } from "./option-card";

interface PackageOptionsEditorProps {
  value: PackageOption[];
  onChange: (options: PackageOption[]) => void;
  showHeading?: boolean;
}

export function PackageOptionsEditor({ value = [], onChange, showHeading = true }: PackageOptionsEditorProps) {
  const handleAddOption = () => {
    const newOption: PackageOption = {
      id: crypto.randomUUID(),
      name: value.length === 0 ? "Standard Package" : `Option ${value.length + 1}`,
      description: "",
      quota: 0,
      times: [],
      isFlatRate: false,
      pricingTiers: []
    };
    onChange([...value, newOption]);
  };

  const handleUpdateOption = (updatedOption: PackageOption) => {
    const newOptions = value.map(opt => 
      opt.id === updatedOption.id ? updatedOption : opt
    );
    onChange(newOptions);
  };

  const handleRemoveOption = (id: string) => {
    onChange(value.filter(opt => opt.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className={`flex items-center ${showHeading ? "justify-between" : "justify-start"}`}>
        {showHeading && (
          <h3 className="text-lg font-medium text-foreground">Package Options</h3>
        )}
      </div>

      <div className="space-y-4">
        {value.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/20 text-center">
            <div className="bg-muted p-3 rounded-full mb-4">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">No options defined</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">
              Create at least one package option (e.g. "Standard", "VIP") to set pricing and quotas.
            </p>
          </div>
        ) : (
          value.map((option, index) => (
            <OptionCard
              key={option.id || index}
              option={option}
              onChange={handleUpdateOption}
              onRemove={() => handleRemoveOption(option.id)}
              defaultExpanded={false}
            />
          ))
        )}
        <button
          type="button"
          onClick={handleAddOption}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-background py-4 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 text-primary">
            <Plus className="h-4 w-4" />
          </span>
          Add option
        </button>
      </div>
    </div>
  );
}
