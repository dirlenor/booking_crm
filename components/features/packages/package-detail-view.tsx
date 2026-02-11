"use client";

import { TourPackage } from "@/lib/mock-data/packages";
import { PackageDetailHeader } from "./package-detail-header";
import { PackageInfo } from "./package-info";

interface PackageDetailViewProps {
  tourPackage: TourPackage;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PackageDetailView({ tourPackage, onEdit, onDelete }: PackageDetailViewProps) {
  return (
    <div className="flex flex-col gap-6 p-6 pb-20">
      <PackageDetailHeader tourPackage={tourPackage} onEdit={onEdit} onDelete={onDelete} />
      <PackageInfo tourPackage={tourPackage} />
    </div>
  );
}
