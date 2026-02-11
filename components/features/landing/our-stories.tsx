import { CheckCircle } from "lucide-react";

export function OurStories() {
  const features = [
    "Personalized itineraries tailored to your preferences",
    "24/7 support from our dedicated travel experts",
    "Handpicked accommodations and experiences",
    "Sustainable tourism practices"
  ];

  return (
    <section id="about-us-section" className="py-20 bg-gray-50 scroll-mt-36">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm" data-section="about_visual_left">
            <img
              src="/images/cartoon-landscape-tropical-island-1.png"
              alt="Tropical island illustration"
              className="h-[520px] w-full rounded-2xl object-cover md:h-[580px]"
            />
          </div>

          <div>
            <span className="text-accent font-bold uppercase tracking-wide text-sm">About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-6">Creating Unforgettable Travel Stories Since 2014</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              At 6CATRIP, we believe that travel is not just about visiting new places, but about the stories you bring back. Our mission is to craft journeys that inspire, connect, and transform.
            </p>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="text-accent w-6 h-6 shrink-0" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex gap-4">
              <div className="flex -space-x-4">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-12 h-12 rounded-full border-2 border-white" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-12 h-12 rounded-full border-2 border-white" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-12 h-12 rounded-full border-2 border-white" />
                <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  +2k
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-primary">Happy Travelers</span>
                <span className="text-xs text-gray-500">Join our community</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
