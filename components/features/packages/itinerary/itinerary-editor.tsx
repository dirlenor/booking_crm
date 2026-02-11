"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PackageItineraryItem {
  id: string;
  day_number: number;
  title: string;
  description: string;
}

interface ItineraryEditorProps {
  value: PackageItineraryItem[];
  onChange: (next: PackageItineraryItem[]) => void;
}

export function ItineraryEditor({ value, onChange }: ItineraryEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(value[0]?.id ?? null);

  const addItem = () => {
    const next: PackageItineraryItem = {
      id: crypto.randomUUID(),
      day_number: Math.max(1, value.length + 1),
      title: "",
      description: "",
    };
    onChange([...value, next]);
    setExpandedId(next.id);
  };

  const removeItem = (id: string) => {
    const next = value.filter((item) => item.id !== id);
    onChange(next);
    if (expandedId === id) {
      setExpandedId(next[0]?.id ?? null);
    }
  };

  const updateItem = (id: string, patch: Partial<PackageItineraryItem>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          No itinerary yet. Add day plans for this package.
        </div>
      ) : (
        value.map((item, index) => {
          const expanded = expandedId === item.id;
          return (
            <Card key={item.id} className="overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/20"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setExpandedId(expanded ? null : item.id);
                  }
                }}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Day {item.day_number || index + 1}</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.title?.trim() || "Untitled itinerary item"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className={cn("text-muted-foreground", expanded && "text-primary")}>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {expanded && (
                <div className="space-y-4 border-t px-4 py-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Day</label>
                      <Input
                        type="number"
                        min={1}
                        value={item.day_number}
                        onChange={(event) => updateItem(item.id, { day_number: Number(event.target.value || 1) })}
                      />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={item.title}
                        onChange={(event) => updateItem(item.id, { title: event.target.value })}
                        placeholder="Morning temple walk"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={item.description}
                      onChange={(event) => updateItem(item.id, { description: event.target.value })}
                      placeholder="Describe this itinerary step..."
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })
      )}

      <Button type="button" variant="outline" className="w-full gap-2" onClick={addItem}>
        <Plus className="h-4 w-4" />
        Add itinerary item
      </Button>
    </div>
  );
}
