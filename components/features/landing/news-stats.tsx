import { Users, Globe, Award, Smile, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TravelStats() {
  const stats = [
    { icon: Users, value: "50k+", label: "Happy Travelers" },
    { icon: Globe, value: "100+", label: "Destinations" },
    { icon: Award, value: "15+", label: "Awards Won" },
    { icon: Smile, value: "99%", label: "Satisfaction Rate" },
  ];

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
          {stats.map((stat, index) => (
            <div key={index} className="p-4">
              <stat.icon className="w-10 h-10 mx-auto mb-4 text-accent" />
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm md:text-base text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LatestNews() {
  const articles = [
    {
      title: "Top 10 Hidden Gems in Thailand",
      category: "Destinations",
      date: "May 15, 2026",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop",
      excerpt: "Discover the untouched beauty of Thailand's secret islands and mountains."
    },
    {
      title: "Essential Packing Guide for Asia",
      category: "Travel Tips",
      date: "May 10, 2026",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
      excerpt: "Don't forget these essential items for your next Asian adventure."
    },
    {
      title: "Sustainable Travel: How to Help",
      category: "Eco Tourism",
      date: "May 05, 2026",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
      excerpt: "Learn how to travel responsibly and leave a positive impact on local communities."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-accent font-bold uppercase tracking-wide text-sm">Travel Blog</span>
            <h2 className="text-3xl font-bold text-primary mt-2">Latest News & Articles</h2>
          </div>
          <Button variant="outline" className="hidden md:flex">Read All Articles</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  {article.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>{article.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-900 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <a href="#" className="inline-flex items-center gap-1 text-accent font-semibold text-sm hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full">Read All Articles</Button>
        </div>
      </div>
    </section>
  );
}
