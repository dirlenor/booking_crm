import { PackageOption } from "@/types/package-options";

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  content: string;
}

export interface DailyItinerary {
  day: number;
  title: string;
  activities: {
    time: string;
    description: string;
    location?: string;
    icon?: "transport" | "food" | "activity" | "hotel" | "other";
  }[];
}

export interface DestinationDetail {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  status: "published" | "draft" | "archived";
  images: {
    url: string;
    caption: string;
    isCover?: boolean;
  }[];
  stats: {
    duration: string;
    minPax: number;
    maxPax: number;
    difficulty: "Easy" | "Moderate" | "Hard";
    rating: number;
    reviewCount: number;
  };
  options: PackageOption[];
  itinerary: DailyItinerary[];
  inclusions: string[];
  exclusions: string[];
  reviews: Review[];
  startPrice: number;
}

export const MOCK_PACKAGE_DETAIL: DestinationDetail = {
  id: "pkg-001",
  title: "Ultimate Kyoto & Osaka Discovery",
  subtitle: "Experience the perfect blend of tradition and modernity in Japan's cultural capitals.",
  location: "Kyoto & Osaka, Japan",
  description: "Immerse yourself in the enchanting world of Japan. From the serene temples of Kyoto to the vibrant neon streets of Osaka, this 7-day journey offers an unforgettable taste of the Kansai region. Enjoy private tea ceremonies, authentic kaiseki dining, and express passes to Universal Studios Japan.",
  status: "published",
  startPrice: 45000,
  images: [
    {
      url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
      caption: "Fushimi Inari Taisha",
      isCover: true,
    },
    {
      url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=2070&auto=format&fit=crop",
      caption: "Arashiyama Bamboo Grove",
    },
    {
      url: "https://images.unsplash.com/photo-1524354226162-421b8c2d2873?q=80&w=1827&auto=format&fit=crop",
      caption: "Dotonbori Canal",
    },
    {
      url: "https://images.unsplash.com/photo-1528360983277-13d9b152c6d1?q=80&w=2070&auto=format&fit=crop",
      caption: "Osaka Castle",
    },
    {
      url: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=2071&auto=format&fit=crop",
      caption: "Cherry Blossoms",
    },
  ],
  stats: {
    duration: "7 Days / 6 Nights",
    minPax: 2,
    maxPax: 12,
    difficulty: "Easy",
    rating: 4.8,
    reviewCount: 124,
  },
  options: [
    {
      id: "opt-001",
      name: "Standard Package",
      description: "4-star accommodation, standard rail pass, and group tours.",
      quota: 20,
      isFlatRate: false,
      pricingTiers: [
        { id: "tier-1", minPax: 2, maxPax: 4, pricePerPerson: 45000 },
        { id: "tier-2", minPax: 5, maxPax: 10, pricePerPerson: 42000 },
        { id: "tier-3", minPax: 11, maxPax: null, pricePerPerson: 39000 },
      ],
    },
    {
      id: "opt-002",
      name: "Premium Package",
      description: "5-star ryokan stay, private driver, and kaiseki dinners.",
      quota: 8,
      isFlatRate: false,
      pricingTiers: [
        { id: "tier-p1", minPax: 2, maxPax: 4, pricePerPerson: 75000 },
        { id: "tier-p2", minPax: 5, maxPax: null, pricePerPerson: 68000 },
      ],
    },
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival in Osaka",
      activities: [
        { time: "14:00", description: "Arrival at Kansai International Airport (KIX)", icon: "transport" },
        { time: "16:00", description: "Private transfer to hotel in Namba", icon: "transport" },
        { time: "19:00", description: "Welcome dinner at Dotonbori (Street Food Tour)", icon: "food" },
      ],
    },
    {
      day: 2,
      title: "Osaka Highlights",
      activities: [
        { time: "09:00", description: "Visit Osaka Castle & Museum", icon: "activity" },
        { time: "12:00", description: "Lunch at Kuromon Ichiba Market", icon: "food" },
        { time: "14:00", description: "Umeda Sky Building Observatory", icon: "activity" },
        { time: "18:00", description: "Free time for shopping in Shinsaibashi", icon: "other" },
      ],
    },
    {
      day: 3,
      title: "Day Trip to Kyoto (Cultural Heritage)",
      activities: [
        { time: "08:30", description: "Express train to Kyoto", icon: "transport" },
        { time: "10:00", description: "Kinkaku-ji (Golden Pavilion)", icon: "activity" },
        { time: "13:00", description: "Arashiyama Bamboo Grove & Tenryu-ji", icon: "activity" },
        { time: "17:00", description: "Return to Osaka", icon: "transport" },
      ],
    },
    {
      day: 4,
      title: "Universal Studios Japan",
      activities: [
        { time: "08:00", description: "Full day at USJ with Express Pass", icon: "activity" },
        { time: "20:00", description: "Return to hotel", icon: "transport" },
      ],
    },
  ],
  inclusions: [
    "6 nights accommodation (based on option selected)",
    "Daily breakfast and 3 dinners",
    "Airport transfers (round trip)",
    "Kansai Thru Pass (3 days)",
    "USJ Studio Pass + Express 4",
    "English speaking guide",
  ],
  exclusions: [
    "International flights",
    "Visa fees",
    "Travel insurance",
    "Personal expenses",
    "Meals not mentioned",
  ],
  reviews: [
    {
      id: "rev-1",
      author: "Sarah J.",
      rating: 5,
      date: "2023-10-15",
      content: "Absolutely amazing experience! The private driver option was worth every penny. Kyoto was magical.",
    },
    {
      id: "rev-2",
      author: "Michael Chen",
      rating: 4,
      date: "2023-09-22",
      content: "Great itinerary, but the weather was a bit hot. The guides were very knowledgeable though.",
    },
    {
      id: "rev-3",
      author: "Emily Watson",
      rating: 5,
      date: "2023-11-05",
      content: "Everything was perfectly organized. The food tour in Osaka was the highlight!",
    },
  ],
};
