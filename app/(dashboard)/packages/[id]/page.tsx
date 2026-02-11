"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPackageById, deletePackage } from "@/lib/supabase/packages";
import type { PackageOption } from "@/types/package-options";
import type { PackageWithItinerary } from "@/types/database";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id as string;
  
  const [pkg, setPkg] = useState<PackageWithItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) return;
    
    const loadPackage = async () => {
      setLoading(true);
      setError(null);

      const res = await getPackageById(packageId);

      if (res.error) {
        setError(res.error);
      } else {
        setPkg(res.data);
      }
      
      setLoading(false);
    };

    loadPackage();
  }, [packageId]);

  const handleDelete = async () => {
    if (!confirm("Delete this package?")) return;
    
    const { error } = await deletePackage(packageId);

    if (error) {
      alert(error);
    } else {
      router.push("/packages");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-xl font-semibold mb-2">Package Not Found</h2>
        <p className="text-muted-foreground mb-4">The package you're looking for doesn't exist.</p>
        <Link href="/packages" className="text-primary hover:underline">
          ← Back to Packages
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return "bg-green-100 text-green-700";
      case 'draft': return "bg-gray-100 text-gray-700";
      case 'archived': return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const options: PackageOption[] = pkg.options || [];

  const coverImage =
    (Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 ? pkg.image_urls[0] : null) ||
    pkg.image_url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative h-64 md:h-80 bg-gray-900">
        <img
          src={coverImage}
          alt={pkg.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Link href="/packages">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Badge className={`mb-2 ${getStatusColor(pkg.status)}`}>
                  {pkg.status}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{pkg.name}</h1>
                <p className="text-white/80 mt-1">{pkg.destination}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(pkg.base_price || 0)}
                </span>
                <span className="text-white/60">/person</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-semibold">{pkg.duration || "N/A"}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Max Pax</div>
              <div className="font-semibold">{pkg.max_pax || "N/A"}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Category</div>
              <div className="font-semibold">{pkg.category || "N/A"}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-semibold text-primary">{formatCurrency(pkg.base_price || 0)}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed">{pkg.description || "No description available."}</p>
            </section>

            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Package Options</h2>
              {options.length === 0 ? (
                <div className="text-muted-foreground text-center py-8 bg-gray-50 rounded-lg">
                  No options available for this package.
                </div>
              ) : (
                <div className="space-y-4">
                  {options.map((opt: PackageOption) => (
                    <div key={opt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{opt.name}</h3>
                          <p className="text-sm text-muted-foreground">{opt.description}</p>
                        </div>
                        <Badge variant="secondary">Quota: {opt.quota}</Badge>
                      </div>
                      
                      {opt.isFlatRate ? (
                        <div className="mt-3">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(opt.flatRatePrice || 0)}
                          </span>
                          <span className="text-sm text-muted-foreground"> /person</span>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {opt.pricingTiers?.map((tier) => (
                            <div key={tier.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {tier.minPax} - {tier.maxPax || "∞"} pax
                              </span>
                              <span className="font-semibold">{formatCurrency(tier.pricePerPerson)}/person</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {pkg.highlights && pkg.highlights.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {pkg.highlights.map((highlight: string, idx: number) => (
                    <Badge key={idx} variant="outline">{highlight}</Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <Link href={`/packages/${packageId}/edit`} className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Package
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
