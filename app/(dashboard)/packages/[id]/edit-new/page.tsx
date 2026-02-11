"use client";

import { useState } from "react";
import ProductBackofficeLayout, {
  FormCard,
  FormField,
  FormSection,
} from "@/components/features/products/product-backoffice-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Route,
  Settings,
  Info,
} from "lucide-react";

// Mock data สำหรับตัวอย่าง
const mockActivityGroups = [
  {
    id: "act-1",
    name: "Thai Cooking Class in Phuket",
    packages: [
      {
        id: "pkg-611950",
        name: "Morning Class without Hotel Transfer",
        status: "published" as const,
        type: "package" as const,
      },
      {
        id: "pkg-614694",
        name: "Afternoon Class without Hotel Transfer",
        status: "published" as const,
        type: "package" as const,
      },
      {
        id: "pkg-611949",
        name: "Morning Class with Hotel Transfer",
        status: "draft" as const,
        type: "package" as const,
      },
      {
        id: "pkg-614693",
        name: "Afternoon Class with Hotel Transfer",
        status: "archived" as const,
        type: "package" as const,
      },
    ],
  },
];

const mockChecklistItems = [
  { id: "1", label: "Complete activity info", completed: true, required: true },
  { id: "2", label: "Activity details", completed: true, required: true },
  { id: "3", label: "Package images (min 3)", completed: false, required: true },
  { id: "4", label: "Pricing & options", completed: false, required: true },
  { id: "5", label: "Itinerary details", completed: false, required: false },
  { id: "6", label: "Cancellation policy", completed: true, required: true },
];

const tabs = [
  { id: "info", label: "Package info", icon: <FileText className="size-4" /> },
  { id: "itinerary", label: "Itinerary", icon: <Route className="size-4" /> },
  { id: "details", label: "Package details", icon: <Settings className="size-4" /> },
  { id: "other", label: "Other info", icon: <Info className="size-4" /> },
];

export default function ProductEditExamplePage() {
  const [activeTab, setActiveTab] = useState("info");
  const [selectedPackageId, setSelectedPackageId] = useState("pkg-611950");

  const completedCount = mockChecklistItems.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / mockChecklistItems.length) * 100);

  return (
    <ProductBackofficeLayout
      title="611950-Morning Class without Hotel Transfer"
      subtitle="ID: 611950"
      status={{ label: "Published", variant: "success" }}
      approvalStatus={{ label: "Approved", variant: "success" }}
      primaryAction={{
        label: "Unpublish package",
        onClick: () => console.log("Unpublish"),
        variant: "outline",
      }}
      secondaryActions={[
        {
          label: "Preview",
          onClick: () => console.log("Preview"),
        },
      ]}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      activityGroups={mockActivityGroups}
      selectedPackageId={selectedPackageId}
      onSelectPackage={setSelectedPackageId}
      showChecklist={true}
      checklistItems={mockChecklistItems}
      checklistProgress={progress}
      onChecklistItemClick={(id) => console.log("Click checklist:", id)}
    >
      {/* ========================================
          TAB: Package Info
          ======================================== */}
      {activeTab === "info" && (
        <div className="max-w-3xl space-y-6">
          <Button variant="outline" size="sm" className="mb-4">
            Copy from/to other packages
          </Button>

          <FormCard title="Basic Info">
            <FormSection title="Package Information" className="space-y-4">
              <FormField label="Package title" required hint="36/80 characters">
                <Input
                  defaultValue="Morning Class without Hotel Transfer"
                  className="max-w-md"
                />
              </FormField>

              <FormField label="Merchant" hint="This can only be changed when the package and units under this package are unpublished">
                <Input
                  defaultValue="23944 - Northern All Star Co.,Ltd."
                  disabled
                  className="max-w-md bg-gray-50"
                />
              </FormField>

              <FormField label="Contact method for package" required>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                    <Input defaultValue="+66-63102..." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email</label>
                    <Input defaultValue="neptunebox..." />
                  </div>
                </div>
              </FormField>
            </FormSection>
          </FormCard>

          <FormCard title="Description">
            <FormField label="Short description" required>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Enter short description..."
                defaultValue="Learn authentic Thai cooking with professional chefs in Phuket. Includes market tour and hands-on cooking experience."
              />
            </FormField>
          </FormCard>
        </div>
      )}

      {/* ========================================
          TAB: Itinerary
          ======================================== */}
      {activeTab === "itinerary" && (
        <div className="max-w-3xl">
          <FormCard title="Daily Itinerary">
            <div className="space-y-4">
              {[1, 2, 3].map((day) => (
                <div
                  key={day}
                  className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                    {day}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Day title"
                      defaultValue={
                        day === 1
                          ? "Morning Market Tour"
                          : day === 2
                          ? "Cooking Class"
                          : "Food Tasting"
                      }
                    />
                    <textarea
                      className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
                      placeholder="Day description..."
                      defaultValue="Explore local market and learn about Thai ingredients"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2">
                Add Day
              </Button>
            </div>
          </FormCard>
        </div>
      )}

      {/* ========================================
          TAB: Package Details
          ======================================== */}
      {activeTab === "details" && (
        <div className="max-w-3xl space-y-6">
          <FormCard title="Pricing">
            <FormSection title="Base Price" className="space-y-4">
              <FormField label="Adult price" required>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    THB
                  </span>
                  <Input defaultValue="2500" className="pl-12" />
                </div>
              </FormField>
              <FormField label="Child price (3-11 years)">
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    THB
                  </span>
                  <Input defaultValue="1800" className="pl-12" />
                </div>
              </FormField>
            </FormSection>
          </FormCard>

          <FormCard title="Capacity">
            <FormSection title="Capacity Settings" className="space-y-4">
              <FormField label="Maximum participants" required>
                <Input type="number" defaultValue="20" className="max-w-xs" />
              </FormField>
              <FormField label="Minimum participants">
                <Input type="number" defaultValue="2" className="max-w-xs" />
              </FormField>
            </FormSection>
          </FormCard>
        </div>
      )}

      {/* ========================================
          TAB: Other Info
          ======================================== */}
      {activeTab === "other" && (
        <div className="max-w-3xl">
          <FormCard title="Additional Information">
            <FormSection title="Inclusions" className="space-y-3">
              {["English-speaking guide", "All ingredients", "Recipe book", "Certificate"].map(
                (item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                )
              )}
            </FormSection>

            <div className="border-t border-gray-100 my-6" />

            <FormSection title="Exclusions" className="space-y-3">
              {["Hotel transfer (unless selected)", "Personal expenses", "Alcoholic beverages"].map(
                (item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                )
              )}
            </FormSection>
          </FormCard>
        </div>
      )}
    </ProductBackofficeLayout>
  );
}
