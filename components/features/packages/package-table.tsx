import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TourPackage } from "@/lib/mock-data/packages";
import { PackageQuotaDisplay } from "./package-quota-display";
import { cn } from "@/lib/utils";

interface PackageTableProps {
  packages: TourPackage[];
  onDelete: (packageId: string) => void;
}

const getStatusDot = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-500";
    case "draft":
      return "bg-amber-400";
    case "archived":
      return "bg-red-500";
    default:
      return "bg-slate-300";
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDurationShort = (duration: string) => {
  const daysMatch = duration.match(/(\d+)\s*Day/i);
  const nightsMatch = duration.match(/(\d+)\s*Night/i);
  const days = daysMatch ? Number(daysMatch[1]) : 0;
  const nights = nightsMatch ? Number(nightsMatch[1]) : 0;
  if (!days && !nights) return duration;
  if (!nights) return `${days}D`;
  return `${days}D/${nights}N`;
};

export function PackageTable({ packages, onDelete }: PackageTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead className="hidden lg:table-cell">Destination</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead className="hidden lg:table-cell">Quota</TableHead>
              <TableHead className="hidden md:table-cell">Options</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-[90px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id} className="hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", getStatusDot(pkg.status))}
                      title={pkg.status}
                    />
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-muted">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/packages/${pkg.id}/edit`}
                        className="font-semibold text-foreground hover:underline line-clamp-1"
                      >
                        {pkg.name}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {pkg.highlights?.slice(0, 2).join(" · ") || "Highlights not set"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {pkg.destination}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatDurationShort(pkg.duration)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="max-w-[140px]">
                    <PackageQuotaDisplay current={pkg.currentPax} max={pkg.maxPax} />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {pkg.optionsCount ?? 0}
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {formatCurrency(pkg.price)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/packages/${pkg.id}/edit`} aria-label="Edit package">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(pkg.id)}
                      aria-label="Delete package"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
