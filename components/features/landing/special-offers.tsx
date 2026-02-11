import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpecialOffers() {
  const offers = [
    {
      title: "Universal Studios Japan",
      ticketType: "Theme Park Ticket",
      description: "Full-day pass with iconic rides and seasonal shows.",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=1200&auto=format&fit=crop",
      color: "bg-pink-500",
      valid: "Best Seller",
      location: "Osaka, Japan",
      price: "THB 2,450"
    },
    {
      title: "Singapore Zoo",
      ticketType: "Zoo Admission",
      description: "Explore wildlife zones and immersive rainforest trails.",
      image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1200&auto=format&fit=crop",
      color: "bg-blue-500",
      valid: "Family Pick",
      location: "Singapore",
      price: "THB 1,190"
    },
    {
      title: "Vana Nava Water Jungle",
      ticketType: "Water Park Pass",
      description: "Enjoy slides, wave pools, and tropical fun for all ages.",
      image: "https://images.unsplash.com/photo-1621205849702-40fcb8f16f95?q=80&w=1200&auto=format&fit=crop",
      color: "bg-green-500",
      valid: "Hot Deal",
      location: "Hua Hin, Thailand",
      price: "THB 1,050"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Limited Time</span>
            </div>
            <h2 className="text-3xl font-bold text-primary">Special Ticket</h2>
            <p className="text-gray-500 mt-2">Grab these amazing deals before they expire</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" data-section="special_ticket_list">
          {offers.map((offer, index) => (
            <article key={index} className="h-[200px] min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" data-section={`special_ticket_card_${index + 1}`}>
              <div className="grid h-full grid-cols-[3fr_2fr]" data-section="special_ticket_card_layout">
                <div className="relative h-full" data-section="special_ticket_media">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="h-full w-full object-cover"
                  />
                  <span className={`${offer.color} absolute left-4 top-4 rounded-md px-3 py-1 text-xs font-bold text-white`}>
                    {offer.valid}
                  </span>
                </div>

                <div className="relative flex h-full min-w-0 flex-col justify-between p-2" data-section="special_ticket_info">
                  <div className="absolute left-0 top-2 h-[calc(100%-1rem)] border-l-2 border-dashed border-gray-200" />
                  <div className="min-w-0 pl-2">
                    <h3 className="mb-0.5 text-sm font-bold text-primary">{offer.price}</h3>
                    <h4 className="mb-0.5 line-clamp-1 break-words text-xs font-semibold text-gray-900">{offer.title}</h4>
                    <p className="mb-0.5 line-clamp-1 break-words text-[11px] font-medium text-gray-600">{offer.ticketType}</p>
                    <p className="mb-1 inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1 break-words">{offer.location}</span>
                    </p>
                    <p className="line-clamp-1 break-words text-[11px] text-gray-600">{offer.description}</p>
                  </div>

                  <div className="pl-2 pt-2">
                    <Button size="sm" className="h-7 w-fit gap-1 bg-primary px-2 text-[11px] text-white hover:bg-primary/90">
                      Book Ticket <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
