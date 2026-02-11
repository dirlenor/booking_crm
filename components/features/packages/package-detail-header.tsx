import Link from "next/link";
import { ArrowLeft, Edit, MoreVertical, Share2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TourPackage } from "@/lib/mock-data/packages";
import { cn } from "@/lib/utils";

interface PackageDetailHeaderProps {
  tourPackage: TourPackage;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PackageDetailHeader({ tourPackage, onEdit, onDelete }: PackageDetailHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200";
      case 'draft':
        return "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200";
      case 'archived':
        return "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/packages">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Packages</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">{tourPackage.id}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {tourPackage.name}
            </h1>
            <Badge variant="outline" className={cn("font-normal capitalize", getStatusColor(tourPackage.status))}>
              {tourPackage.status}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {tourPackage.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
