import { MapPin } from "lucide-react";

export function AttractionsCarousel() {
  const attractions = [
    { name: "Grand Palace", location: "Bangkok", image: "https://images.unsplash.com/photo-1599543887019-9c5952d7e5ce?q=80&w=1000&auto=format&fit=crop" },
    { name: "Doi Suthep", location: "Chiang Mai", image: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?q=80&w=1000&auto=format&fit=crop" },
    { name: "Maya Bay", location: "Krabi", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop" },
    { name: "Big Buddha", location: "Phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1000&auto=format&fit=crop" },
    { name: "Floating Market", location: "Ratchaburi", image: "https://images.unsplash.com/photo-1595166649733-89b441400e2b?q=80&w=1000&auto=format&fit=crop" },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Must-Visit Attractions</h2>
          <p className="text-gray-500">Iconic landmarks you shouldn't miss</p>
        </div>
      </div>
      
      {/* Scroll Container */}
      <div className="flex overflow-x-auto gap-6 pb-8 px-4 md:px-0 no-scrollbar snap-x snap-mandatory container mx-auto">
        {attractions.map((attr, index) => (
          <div key={index} className="min-w-[280px] md:min-w-[320px] h-[400px] rounded-2xl overflow-hidden relative group snap-center cursor-pointer">
            <img 
              src={attr.image} 
              alt={attr.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-2xl font-bold text-white mb-1">{attr.name}</h3>
              <div className="flex items-center gap-1 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{attr.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
