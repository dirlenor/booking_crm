import { Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Travel Enthusiast",
      image: "https://i.pravatar.cc/150?img=5",
      text: "The trip to Thailand was absolutely magical. 6CATRIP handled everything seamlessly, from flights to local tours. Highly recommended!"
    },
    {
      name: "Michael Chen",
      role: "Adventure Seeker",
      image: "https://i.pravatar.cc/150?img=11",
      text: "I've used many travel agencies before, but 6CATRIP stands out. The attention to detail and personalized service were exceptional."
    },
    {
      name: "Emily Davis",
      role: "Family Traveler",
      image: "https://i.pravatar.cc/150?img=9",
      text: "Planning a family vacation can be stressful, but 6CATRIP made it easy. We had a wonderful time in Japan. Thank you!"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-accent font-bold uppercase tracking-wide text-sm">Testimonials</span>
          <h2 className="text-3xl font-bold text-primary mt-2">What Our Travelers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-2xl relative group hover:shadow-lg transition-shadow duration-300">
              <Quote className="text-accent/20 w-12 h-12 absolute top-6 right-6" />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-primary">{item.name}</h4>
                  <span className="text-xs text-gray-500">{item.role}</span>
                </div>
              </div>
              
              <p className="text-gray-600 italic leading-relaxed">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
