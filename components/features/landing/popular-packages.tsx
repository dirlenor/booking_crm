import { Button } from "@/components/ui/button";
import {
  PopularPackageCard,
  type PopularPackage,
} from "@/components/features/landing/popular-package-card";

export function PopularPackages() {
  const packages: PopularPackage[] = [
    {
      id: "bangkok-cultural-tour",
      title: "Bangkok Cultural Tour",
      location: "Bangkok, Thailand",
      days: "3 Days 2 Nights",
      rating: 4.8,
      reviews: 124,
      price: "THB 4,500",
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1000&auto=format&fit=crop",
      tag: "Best Seller"
    },
    {
      id: "phi-phi-island-adventure",
      title: "Phi Phi Island Adventure",
      location: "Phuket, Thailand",
      days: "4 Days 3 Nights",
      rating: 4.9,
      reviews: 89,
      price: "THB 8,200",
      image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?q=80&w=1000&auto=format&fit=crop",
      tag: "Popular"
    },
    {
      id: "chiang-mai-temple-run",
      title: "Chiang Mai Temple Run",
      location: "Chiang Mai, Thailand",
      days: "3 Days 2 Nights",
      rating: 4.7,
      reviews: 56,
      price: "THB 3,900",
      image: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?q=80&w=1000&auto=format&fit=crop",
      tag: "New"
    },
    {
      id: "krabi-island-hopping",
      title: "Krabi Island Hopping",
      location: "Krabi, Thailand",
      days: "5 Days 4 Nights",
      rating: 4.9,
      reviews: 210,
      price: "THB 12,500",
      image: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1000&auto=format&fit=crop",
      tag: "Top Rated"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-2">Popular Tour Packages</h2>
          <p className="text-gray-500">Explore our best-selling tour packages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => (
            <PopularPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        
        <div className="mt-10 flex justify-center">
          <Button variant="outline" className="border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary px-8">View All Tours</Button>
        </div>
      </div>
    </section>
  );
}
