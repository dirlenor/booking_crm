import { PackageOption } from '@/types/package-options';

export interface TourPackage {
  id: string;
  name: string;
  description: string;
  destination: string;
  duration: string; // e.g., "3 Days 2 Nights"
  days: number;
  nights: number;
  price: number;
  maxPax: number;
  currentPax: number;
  departureDate: string;
  status: 'published' | 'draft' | 'archived';
  category: 'Adventure' | 'Cultural' | 'Relaxation' | 'City' | 'Nature' | 'Luxury';
  highlights: string[];
  imageUrl: string;
  optionsCount?: number;
  options: PackageOption[];
}

export const packages: TourPackage[] = [
  {
    id: 'PKG-001',
    name: 'Grand Palace & Emerald Buddha Tour',
    description: 'Embark on an unforgettable journey through Thailand most iconic royal landmarks with our Grand Palace & Emerald Buddha Tour. This comprehensive full-day experience takes you deep into the heart of Bangkok historic Rattanakosin Island, where you will witness the breathtaking grandeur of the Grand Palace, the official residence of the Kings of Siam since 1782. Marvel at the intricate Thai architecture, gilded spires, and ornate details that showcase the pinnacle of traditional Thai craftsmanship. The highlight of your visit is the Temple of the Emerald Buddha (Wat Phra Kaew), Thailand most sacred Buddhist temple, housing the revered Emerald Buddha statue carved from a single block of jade. Your expert local guide will share fascinating stories about Thai history, royal ceremonies, and Buddhist traditions. The tour includes comfortable hotel pickup and drop-off, ensuring a seamless experience from start to finish. Perfect for first-time visitors and history enthusiasts alike.',
    destination: 'Bangkok',
    duration: '1 Day',
    days: 1,
    nights: 0,
    price: 2500,
    maxPax: 15,
    currentPax: 8,
    departureDate: '2024-03-15',
    status: 'published',
    category: 'Cultural',
    highlights: ['Grand Palace', 'Emerald Buddha Temple', 'Local Guide', 'Hotel Pickup', 'Traditional Architecture'],
    imageUrl: 'https://images.unsplash.com/photo-1590452366249-0d3a5105db09?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-001-1',
        name: 'Standard Package',
        description: 'Includes entrance fees, English-speaking guide, and hotel transfers',
        quota: 15,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-001-1-1', minPax: 1, maxPax: 2, pricePerPerson: 3500 },
          { id: 'TIER-001-1-2', minPax: 3, maxPax: 5, pricePerPerson: 3000 },
          { id: 'TIER-001-1-3', minPax: 6, maxPax: null, pricePerPerson: 2500 }
        ]
      },
      {
        id: 'OPT-001-2',
        name: 'Premium Package with Thai Lunch',
        description: 'Standard package plus authentic Thai lunch at a riverside restaurant and refreshment package',
        quota: 10,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-001-2-1', minPax: 1, maxPax: 2, pricePerPerson: 4200 },
          { id: 'TIER-001-2-2', minPax: 3, maxPax: 5, pricePerPerson: 3600 },
          { id: 'TIER-001-2-3', minPax: 6, maxPax: null, pricePerPerson: 2900 }
        ]
      },
      {
        id: 'OPT-001-3',
        name: 'Private VIP Experience',
        description: 'Exclusive private tour with personal guide, premium vehicle, skip-the-line access, and gourmet lunch',
        quota: 5,
        isFlatRate: true,
        flatRatePrice: 25000,
        pricingTiers: []
      }
    ]
  },
  {
    id: 'PKG-002',
    name: 'Ayutthaya Historical Park Day Trip',
    description: 'Step back in time over 400 years with our immersive Ayutthaya Historical Park Day Trip. Once the majestic capital of the Kingdom of Siam and one of the world largest and most prosperous cities in the 17th century, Ayutthaya now stands as a UNESCO World Heritage Site, preserving the magnificent ruins of temples, palaces, and monasteries that tell the story of a glorious past. Your journey begins with a comfortable air-conditioned transfer from Bangkok, crossing the Chao Phraya River to reach this historic island city. Explore the iconic Wat Mahathat, famous for the Buddha head entwined in tree roots, and visit Wat Phra Si Sanphet, the royal temple that once housed a 16-meter tall golden Buddha. Enjoy a scenic river cruise along the Chao Phraya River, offering picturesque views of rural Thai life and riverside temples. A delicious Thai lunch is served onboard or at a local restaurant. Your knowledgeable guide will bring history to life with tales of Ayutthaya rise, its golden age of international trade, and its eventual fall. This tour offers a perfect blend of history, culture, and natural beauty.',
    destination: 'Ayutthaya',
    duration: '1 Day',
    days: 1,
    nights: 0,
    price: 1800,
    maxPax: 20,
    currentPax: 12,
    departureDate: '2024-03-20',
    status: 'published',
    category: 'Cultural',
    highlights: ['Wat Mahathat', 'Wat Phra Si Sanphet', 'River Cruise', 'Lunch Included', 'UNESCO Site'],
    imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-002-1',
        name: 'Group Tour by Bus',
        description: 'Join a group tour with round-trip transfer by comfortable coach and English guide',
        quota: 20,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-002-1-1', minPax: 1, maxPax: 1, pricePerPerson: 2200 },
          { id: 'TIER-002-1-2', minPax: 2, maxPax: 4, pricePerPerson: 2000 },
          { id: 'TIER-002-1-3', minPax: 5, maxPax: null, pricePerPerson: 1800 }
        ]
      },
      {
        id: 'OPT-002-2',
        name: 'River Cruise Experience',
        description: 'Travel to Ayutthaya by bus and return by scenic river cruise with buffet lunch',
        quota: 15,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-002-2-1', minPax: 1, maxPax: 1, pricePerPerson: 2800 },
          { id: 'TIER-002-2-2', minPax: 2, maxPax: 4, pricePerPerson: 2500 },
          { id: 'TIER-002-2-3', minPax: 5, maxPax: null, pricePerPerson: 2200 }
        ]
      },
      {
        id: 'OPT-002-3',
        name: 'Private Van Tour',
        description: 'Private transportation for your group with flexible itinerary and dedicated guide',
        quota: 8,
        isFlatRate: true,
        flatRatePrice: 15000,
        pricingTiers: []
      }
    ]
  },
  {
    id: 'PKG-003',
    name: 'Chiang Mai Elephant Sanctuary',
    description: 'Experience the magic of ethical elephant tourism with our immersive 2-day Chiang Mai Elephant Sanctuary program. Nestled in the lush green mountains of Northern Thailand, this sanctuary provides a safe and natural home for rescued elephants who have been saved from logging, street begging, and exploitative tourism. Unlike traditional elephant camps, here you will observe and interact with these gentle giants in their natural habitat without riding or forcing them to perform tricks. Your experience includes feeding the elephants their favorite treats like bananas and sugarcane, walking alongside them through the jungle, and even helping bathe them in the refreshing river. Learn about elephant behavior, biology, and conservation efforts from passionate guides who have dedicated their lives to these magnificent creatures. You will stay overnight in a traditional Karen hill tribe homestay, experiencing authentic local culture, enjoying home-cooked Thai meals, and sleeping in comfortable accommodations surrounded by nature. The second day features a guided jungle trek to a beautiful waterfall where you can swim and relax. This transformative experience not only creates unforgettable memories but also directly supports elephant welfare and local communities.',
    destination: 'Chiang Mai',
    duration: '2 Days 1 Night',
    days: 2,
    nights: 1,
    price: 4500,
    maxPax: 10,
    currentPax: 4,
    departureDate: '2024-04-05',
    status: 'published',
    category: 'Adventure',
    highlights: ['Elephant Feeding', 'Jungle Trek', 'Waterfall Visit', 'Homestay', 'Ethical Tourism'],
    imageUrl: 'https://images.unsplash.com/photo-1566432726359-543597816e02?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-003-1',
        name: 'Basic Overnight Stay',
        description: 'Includes all elephant activities, homestay accommodation, and 4 meals',
        quota: 10,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-003-1-1', minPax: 1, maxPax: 1, pricePerPerson: 5500 },
          { id: 'TIER-003-1-2', minPax: 2, maxPax: 3, pricePerPerson: 4900 },
          { id: 'TIER-003-1-3', minPax: 4, maxPax: null, pricePerPerson: 4500 }
        ]
      },
      {
        id: 'OPT-003-2',
        name: 'Premium with Private Room',
        description: 'Upgrade to private room with ensuite bathroom, plus welcome kit and additional activities',
        quota: 6,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-003-2-1', minPax: 1, maxPax: 1, pricePerPerson: 6500 },
          { id: 'TIER-003-2-2', minPax: 2, maxPax: 3, pricePerPerson: 5800 },
          { id: 'TIER-003-2-3', minPax: 4, maxPax: null, pricePerPerson: 5200 }
        ]
      },
      {
        id: 'OPT-003-3',
        name: 'Family Package',
        description: 'Special package for families with children under 12, includes kids activities and flexible schedule',
        quota: 4,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-003-3-1', minPax: 2, maxPax: 3, pricePerPerson: 4000 },
          { id: 'TIER-003-3-2', minPax: 4, maxPax: null, pricePerPerson: 3600 }
        ]
      }
    ]
  },
  {
    id: 'PKG-004',
    name: 'Phuket Island Hopping Luxury Yacht',
    description: 'Set sail on the adventure of a lifetime aboard our luxury yacht for an exclusive Phuket island-hopping experience. Cruise across the crystal-clear turquoise waters of the Andaman Sea, visiting world-famous destinations including the stunning Phi Phi Islands, the legendary Maya Bay (featured in The Beach movie), and hidden gems known only to locals. Your day begins with a warm welcome onboard our premium yacht, complete with spacious sun decks, comfortable indoor lounges, and modern amenities. As we navigate through dramatic limestone cliffs rising from emerald waters, you will have multiple opportunities to snorkel among vibrant coral reefs teeming with tropical fish, sea turtles, and colorful marine life. Our experienced crew serves a gourmet lunch featuring fresh seafood, Thai specialties, and international cuisine, accompanied by complimentary beverages throughout the day. Relax on pristine white-sand beaches, swim in hidden lagoons, and capture Instagram-worthy photos at every turn. The yacht provides the perfect vantage point for witnessing a spectacular Andaman Sea sunset as we cruise back to Phuket. With a maximum of 12 guests, this intimate experience ensures personalized attention and plenty of space to unwind. Ideal for couples, families, and groups of friends seeking a premium island adventure.',
    destination: 'Phuket',
    duration: '1 Day',
    days: 1,
    nights: 0,
    price: 8500,
    maxPax: 12,
    currentPax: 12,
    departureDate: '2024-04-10',
    status: 'published',
    category: 'Relaxation',
    highlights: ['Luxury Yacht', 'Snorkeling', 'Gourmet Lunch', 'Sunset View', 'Phi Phi Islands'],
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed5d94591?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-004-1',
        name: 'Standard Yacht Charter',
        description: 'Shared yacht experience with all activities, meals, and snorkeling equipment included',
        quota: 12,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-004-1-1', minPax: 1, maxPax: 1, pricePerPerson: 9500 },
          { id: 'TIER-004-1-2', minPax: 2, maxPax: 4, pricePerPerson: 8800 },
          { id: 'TIER-004-1-3', minPax: 5, maxPax: null, pricePerPerson: 8500 }
        ]
      },
      {
        id: 'OPT-004-2',
        name: 'Private Yacht Charter',
        description: 'Exclusive private yacht charter for up to 8 guests with customized itinerary',
        quota: 1,
        isFlatRate: true,
        flatRatePrice: 85000,
        pricingTiers: []
      },
      {
        id: 'OPT-004-3',
        name: 'VIP Experience with Seaplane',
        description: 'Arrive in style with seaplane transfer to yacht, premium champagne service, and private beach setup',
        quota: 2,
        isFlatRate: true,
        flatRatePrice: 125000,
        pricingTiers: []
      }
    ]
  },
  {
    id: 'PKG-005',
    name: 'Kanchanaburi & River Kwai History',
    description: 'Journey through one of Thailand most poignant historical chapters with our comprehensive Kanchanaburi and River Kwai tour. This thought-provoking 2-day experience takes you to the site of the infamous Death Railway, built during World War II by prisoners of war and Asian laborers under brutal conditions. Your adventure begins at the iconic Bridge over the River Kwai, an enduring symbol of the wartime tragedy, where you will learn about the railway construction and the lives lost during its building. Visit the JEATH War Museum, housed in a reconstructed POW camp, displaying photographs, artifacts, and personal stories that bring history to life. Experience a nostalgic train ride along the historic Death Railway, crossing the treacherous Wang Pho Viaduct with stunning views of the River Kwai below. The tour also includes a visit to the beautiful Erawan National Park, where you can trek through lush jungle to reach the seven-tiered Erawan Waterfall, known for its emerald-green pools perfect for swimming. Stay overnight in a floating raft hotel on the River Kwai, surrounded by peaceful nature and spectacular sunsets. Enjoy authentic Thai cuisine and the sounds of the jungle as you reflect on the day experiences. This tour offers a perfect balance of historical education and natural beauty.',
    destination: 'Kanchanaburi',
    duration: '2 Days 1 Night',
    days: 2,
    nights: 1,
    price: 3200,
    maxPax: 20,
    currentPax: 15,
    departureDate: '2024-03-25',
    status: 'draft',
    category: 'Cultural',
    highlights: ['Bridge over River Kwai', 'Death Railway Train', 'Erawan Waterfall', 'War Museum', 'Floating Hotel'],
    imageUrl: 'https://images.unsplash.com/photo-1534069894411-a3f2b4c50176?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-005-1',
        name: 'Standard Historical Tour',
        description: 'Group tour with transportation, guide, museum entries, train ride, and standard accommodation',
        quota: 20,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-005-1-1', minPax: 1, maxPax: 1, pricePerPerson: 3800 },
          { id: 'TIER-005-1-2', minPax: 2, maxPax: 4, pricePerPerson: 3500 },
          { id: 'TIER-005-1-3', minPax: 5, maxPax: null, pricePerPerson: 3200 }
        ]
      },
      {
        id: 'OPT-005-2',
        name: 'Premium with Resort Stay',
        description: 'Upgrade to 4-star riverside resort accommodation with spa access and premium dining',
        quota: 10,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-005-2-1', minPax: 1, maxPax: 1, pricePerPerson: 5200 },
          { id: 'TIER-005-2-2', minPax: 2, maxPax: 4, pricePerPerson: 4800 },
          { id: 'TIER-005-2-3', minPax: 5, maxPax: null, pricePerPerson: 4200 }
        ]
      },
      {
        id: 'OPT-005-3',
        name: 'Adventure Package',
        description: 'Includes all historical sites plus extended trekking, cave exploration, and kayaking',
        quota: 8,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-005-3-1', minPax: 1, maxPax: 1, pricePerPerson: 4500 },
          { id: 'TIER-005-3-2', minPax: 2, maxPax: 4, pricePerPerson: 4200 },
          { id: 'TIER-005-3-3', minPax: 5, maxPax: null, pricePerPerson: 3800 }
        ]
      }
    ]
  },
  {
    id: 'PKG-006',
    name: 'Krabi Rock Climbing Adventure',
    description: 'Challenge yourself on world-class limestone cliffs with our thrilling Krabi Rock Climbing Adventure. Railay Beach, accessible only by longtail boat, is renowned globally as one of the premier rock climbing destinations, offering over 700 bolted routes ranging from beginner-friendly to expert-level challenges. Whether you are a complete novice or an experienced climber, our certified professional instructors will ensure a safe and exhilarating experience tailored to your skill level. Your adventure begins with a scenic boat ride from Ao Nang to Railay, surrounded by towering limestone karsts that rise dramatically from the turquoise sea. After a comprehensive safety briefing and equipment fitting with top-quality climbing gear, you will ascend routes with stunning views of the Andaman Sea, tropical beaches, and lush jungle. Between climbs, relax on Railay pristine beaches, explore hidden lagoons, and enjoy a delicious beachside lunch featuring fresh Thai dishes. The area unique geology creates fascinating climbing features including caves, overhangs, and pockets that make every route an adventure. Our small group sizes ensure personalized attention and maximum climbing time. As the day progresses, witness a spectacular sunset from your vantage point high on the cliff face. This adrenaline-pumping experience combines physical challenge with breathtaking natural beauty, creating memories that will last a lifetime.',
    destination: 'Krabi',
    duration: '1 Day',
    days: 1,
    nights: 0,
    price: 2800,
    maxPax: 8,
    currentPax: 2,
    departureDate: '2024-04-15',
    status: 'published',
    category: 'Adventure',
    highlights: ['Railay Beach', 'Professional Gear', 'Certified Guide', 'Beachside Lunch', 'All Skill Levels'],
    imageUrl: 'https://images.unsplash.com/photo-1526487841553-7c38c642e124?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-006-1',
        name: 'Half-Day Introduction',
        description: 'Perfect for beginners with 3 hours of climbing instruction and equipment',
        quota: 8,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-006-1-1', minPax: 1, maxPax: 1, pricePerPerson: 2200 },
          { id: 'TIER-006-1-2', minPax: 2, maxPax: 3, pricePerPerson: 1900 },
          { id: 'TIER-006-1-3', minPax: 4, maxPax: null, pricePerPerson: 1600 }
        ]
      },
      {
        id: 'OPT-006-2',
        name: 'Full-Day Adventure',
        description: 'Complete day of climbing with multiple routes, lunch, and equipment included',
        quota: 6,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-006-2-1', minPax: 1, maxPax: 1, pricePerPerson: 3200 },
          { id: 'TIER-006-2-2', minPax: 2, maxPax: 3, pricePerPerson: 2900 },
          { id: 'TIER-006-2-3', minPax: 4, maxPax: null, pricePerPerson: 2500 }
        ]
      },
      {
        id: 'OPT-006-3',
        name: 'Multi-Pitch Advanced',
        description: 'For experienced climbers - tackle advanced multi-pitch routes with stunning summit views',
        quota: 4,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-006-3-1', minPax: 1, maxPax: 1, pricePerPerson: 4500 },
          { id: 'TIER-006-3-2', minPax: 2, maxPax: null, pricePerPerson: 3800 }
        ]
      }
    ]
  },
  {
    id: 'PKG-007',
    name: 'Bangkok Street Food Walking Tour',
    description: 'Embark on a culinary adventure through the vibrant streets of Bangkok famous Chinatown (Yaowarat) with our immersive Street Food Walking Tour. This gastronomic journey takes you deep into one of the world most renowned street food destinations, where Michelin Guide-recommended vendors stand alongside century-old family stalls serving authentic Thai-Chinese delicacies. Your expert local food guide, passionate about Bangkok culinary heritage, will lead you through bustling alleyways and hidden food corners that most tourists never discover. Sample over 15 different dishes including iconic favorites like Pad Thai prepared by a Michelin-starred street vendor, savory oyster omelets, fragrant boat noodles, crispy pork satay, and the legendary mango sticky rice. Learn about the history of Thai-Chinese cuisine, the stories behind each dish, and the families who have preserved these recipes for generations. The tour includes visits to traditional markets where you will see exotic ingredients and observe local food preparation techniques. Between tastings, explore the fascinating culture of Chinatown, visiting Taoist temples, gold shops, and traditional medicine stores. As evening falls, experience the magical transformation of Yaowarat as neon lights illuminate the street and the night market comes alive. This is more than a food tour - it is a cultural immersion into the heart of Bangkok culinary soul.',
    destination: 'Bangkok',
    duration: '4 Hours',
    days: 1,
    nights: 0,
    price: 1200,
    maxPax: 10,
    currentPax: 6,
    departureDate: '2024-03-18',
    status: 'published',
    category: 'City',
    highlights: ['Chinatown', 'Michelin Street Food', 'Night Market', 'Local Guide', '15+ Food Tastings'],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-007-1',
        name: 'Standard Food Tour',
        description: 'Includes 10+ food tastings, water, and English-speaking guide',
        quota: 10,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-007-1-1', minPax: 1, maxPax: 1, pricePerPerson: 1500 },
          { id: 'TIER-007-1-2', minPax: 2, maxPax: 4, pricePerPerson: 1300 },
          { id: 'TIER-007-1-3', minPax: 5, maxPax: null, pricePerPerson: 1200 }
        ]
      },
      {
        id: 'OPT-007-2',
        name: 'Premium with Drinks',
        description: 'Extended tour with 15+ tastings, beer or Thai herbal drinks, and dessert stops',
        quota: 8,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-007-2-1', minPax: 1, maxPax: 1, pricePerPerson: 2000 },
          { id: 'TIER-007-2-2', minPax: 2, maxPax: 4, pricePerPerson: 1800 },
          { id: 'TIER-007-2-3', minPax: 5, maxPax: null, pricePerPerson: 1600 }
        ]
      },
      {
        id: 'OPT-007-3',
        name: 'Private Group Tour',
        description: 'Exclusive tour for your group of up to 6 people with customized food preferences',
        quota: 3,
        isFlatRate: true,
        flatRatePrice: 12000,
        pricingTiers: []
      }
    ]
  },
  {
    id: 'PKG-008',
    name: 'Similan Islands Snorkeling Trip',
    description: 'Explore the pristine marine life of the Similan Islands with our unforgettable snorkeling adventure. The Similan Islands National Park, located in the Andaman Sea, is renowned worldwide for its crystal-clear blue waters, vibrant coral reefs, and abundant sea life including the famous sea turtles. This full-day excursion takes you to multiple islands in the archipelago, each offering unique underwater landscapes and marine biodiversity. Your journey begins with an early morning pickup and transfer to the pier, followed by a comfortable speedboat ride to the islands. Throughout the day, you will have multiple snorkeling sessions at different locations, giving you the chance to encounter colorful tropical fish, majestic manta rays, and if you are lucky, the gentle whale sharks that occasionally visit these waters. The islands themselves are stunning, with pristine white-sand beaches, unique granite rock formations, and lush tropical forests. Enjoy a delicious Thai lunch served on one of the islands, with time to relax on the beach or hike to a viewpoint for panoramic views of the Andaman Sea. Our experienced guides prioritize safety and environmental responsibility, ensuring you have an amazing experience while protecting this delicate marine ecosystem. National park fees are included in the package. Note: This tour only operates during the open season from October to May.',
    destination: 'Phang Nga',
    duration: '1 Day',
    days: 1,
    nights: 0,
    price: 3900,
    maxPax: 25,
    currentPax: 20,
    departureDate: '2024-04-20',
    status: 'archived',
    category: 'Relaxation',
    highlights: ['Similan Islands', 'Snorkeling', 'Speedboat Transfer', 'National Park Fee', 'Sea Turtles'],
    imageUrl: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-008-1',
        name: 'Standard Speedboat Tour',
        description: 'Group tour by speedboat with snorkeling equipment, lunch, and national park fee included',
        quota: 25,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-008-1-1', minPax: 1, maxPax: 1, pricePerPerson: 4500 },
          { id: 'TIER-008-1-2', minPax: 2, maxPax: 4, pricePerPerson: 4200 },
          { id: 'TIER-008-1-3', minPax: 5, maxPax: null, pricePerPerson: 3900 }
        ]
      },
      {
        id: 'OPT-008-2',
        name: 'Premium with Dive Guide',
        description: 'Small group tour with professional marine biologist guide and underwater photography',
        quota: 12,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-008-2-1', minPax: 1, maxPax: 1, pricePerPerson: 5500 },
          { id: 'TIER-008-2-2', minPax: 2, maxPax: 4, pricePerPerson: 5000 },
          { id: 'TIER-008-2-3', minPax: 5, maxPax: null, pricePerPerson: 4600 }
        ]
      },
      {
        id: 'OPT-008-3',
        name: 'Private Catamaran Charter',
        description: 'Luxury catamaran for up to 15 guests with premium amenities and customized schedule',
        quota: 1,
        isFlatRate: true,
        flatRatePrice: 95000,
        pricingTiers: []
      }
    ]
  },
  // NEW PACKAGES - 3 Additional Tours
  {
    id: 'PKG-009',
    name: 'Doi Inthanon National Park Trek',
    description: 'Discover the natural wonders of Northern Thailand with our comprehensive Doi Inthanon National Park trekking experience. Doi Inthanon, standing at 2,565 meters above sea level, is Thailand highest peak and offers some of the most spectacular mountain scenery in the country. This full-day adventure takes you through diverse ecosystems, from lush rainforests and cascading waterfalls to unique cloud forests at higher elevations. Your journey begins with a visit to the majestic Wachirathan and Sirithan waterfalls, where you can feel the refreshing mist and capture stunning photos. Trek along the famous Kew Mae Pan Nature Trail, a 3-kilometer walking path that offers panoramic views of the surrounding mountains and valleys, often shrouded in mystical morning mist. Visit the twin pagodas built to honor the King and Queen, surrounded by beautiful gardens with colorful flowers. Along the way, you will encounter diverse wildlife, exotic birds, and unique plant species that make this region a biodiversity hotspot. Enjoy a delicious picnic lunch featuring Northern Thai specialties in a scenic location. Our knowledgeable local guides share insights about the Karen and Hmong hill tribe communities who call these mountains home. This tour is perfect for nature lovers, photography enthusiasts, and anyone seeking to escape the heat and experience Thailand cooler mountain climate.',
    destination: 'Chiang Mai',
    duration: '1 Day',
    days: 1,
    nights: 0,
    price: 2200,
    maxPax: 12,
    currentPax: 7,
    departureDate: '2024-05-10',
    status: 'published',
    category: 'Nature',
    highlights: ['Thailand Highest Peak', 'Wachirathan Waterfall', 'Kew Mae Pan Trail', 'Twin Pagodas', 'Cloud Forest'],
    imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-009-1',
        name: 'Standard Trekking Tour',
        description: 'Group tour with transportation, English guide, entrance fees, and lunch included',
        quota: 12,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-009-1-1', minPax: 1, maxPax: 1, pricePerPerson: 2800 },
          { id: 'TIER-009-1-2', minPax: 2, maxPax: 3, pricePerPerson: 2500 },
          { id: 'TIER-009-1-3', minPax: 4, maxPax: null, pricePerPerson: 2200 }
        ]
      },
      {
        id: 'OPT-009-2',
        name: 'Sunrise Special',
        description: 'Early morning departure to catch sunrise at the peak with breakfast included',
        quota: 8,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-009-2-1', minPax: 1, maxPax: 1, pricePerPerson: 3200 },
          { id: 'TIER-009-2-2', minPax: 2, maxPax: 3, pricePerPerson: 2900 },
          { id: 'TIER-009-2-3', minPax: 4, maxPax: null, pricePerPerson: 2600 }
        ]
      },
      {
        id: 'OPT-009-3',
        name: 'Photography Focus',
        description: 'Tour designed for photographers with extended time at scenic spots and professional tips',
        quota: 6,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-009-3-1', minPax: 1, maxPax: 1, pricePerPerson: 3800 },
          { id: 'TIER-009-3-2', minPax: 2, maxPax: null, pricePerPerson: 3400 }
        ]
      }
    ]
  },
  {
    id: 'PKG-010',
    name: 'Koh Samui Luxury Wellness Retreat',
    description: 'Indulge in the ultimate relaxation experience with our 3-day Koh Samui Luxury Wellness Retreat. Nestled on the pristine shores of Thailand second-largest island, this exclusive retreat combines traditional Thai healing practices with modern luxury amenities to rejuvenate your mind, body, and spirit. Your wellness journey begins with a personalized consultation with our expert practitioners who will customize your program based on your specific needs and goals. Each day includes a variety of therapeutic treatments such as traditional Thai massage, herbal compress therapy, aromatherapy sessions, and meditation classes led by experienced instructors. Stay in luxurious private villas featuring traditional Thai architecture, modern comforts, and stunning ocean views. Enjoy gourmet wellness cuisine prepared by our chefs using organic, locally-sourced ingredients that nourish your body while delighting your palate. The retreat also offers yoga sessions on the beach at sunrise, detoxifying steam rooms, infinity pools, and peaceful meditation gardens. Between treatments, explore the island natural beauty with optional activities like snorkeling, temple visits, or simply relaxing on the pristine white-sand beach. Our holistic approach addresses not just physical relaxation but also mental clarity and emotional balance, leaving you feeling completely renewed. This is more than a vacation - it is a transformative journey towards better health and wellbeing.',
    destination: 'Koh Samui',
    duration: '3 Days 2 Nights',
    days: 3,
    nights: 2,
    price: 18500,
    maxPax: 8,
    currentPax: 3,
    departureDate: '2024-05-15',
    status: 'published',
    category: 'Luxury',
    highlights: ['Luxury Private Villa', 'Thai Spa Treatments', 'Yoga & Meditation', 'Organic Wellness Cuisine', 'Beachfront Location'],
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed5d94591?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-010-1',
        name: 'Essential Wellness Package',
        description: 'Includes 2 nights villa accommodation, 4 spa treatments, daily yoga, and all meals',
        quota: 8,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-010-1-1', minPax: 1, maxPax: 1, pricePerPerson: 22000 },
          { id: 'TIER-010-1-2', minPax: 2, maxPax: null, pricePerPerson: 18500 }
        ]
      },
      {
        id: 'OPT-010-2',
        name: 'Premium Detox Program',
        description: 'Comprehensive detox with nutritionist consultation, specialized meals, and 6 treatments',
        quota: 6,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-010-2-1', minPax: 1, maxPax: 1, pricePerPerson: 28000 },
          { id: 'TIER-010-2-2', minPax: 2, maxPax: null, pricePerPerson: 24000 }
        ]
      },
      {
        id: 'OPT-010-3',
        name: 'Couples Romance Retreat',
        description: 'Special package for couples with private couple treatments, romantic dinner, and villa upgrade',
        quota: 4,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-010-3-1', minPax: 2, maxPax: null, pricePerPerson: 32000 }
        ]
      }
    ]
  },
  {
    id: 'PKG-011',
    name: 'Pai Canyon Sunset & Hot Springs',
    description: 'Experience the bohemian charm and natural wonders of Pai with our immersive 2-day canyon sunset and hot springs adventure. Located in the mountains of Mae Hong Son province, Pai has become a beloved destination for travelers seeking a laid-back atmosphere, stunning landscapes, and authentic Northern Thai culture. Your journey from Chiang Mai to Pai takes you along one of Thailand most scenic mountain roads, featuring 762 curves through breathtaking valleys and hill tribe villages. Upon arrival, check into a boutique riverside resort that captures the artistic spirit of Pai. In the late afternoon, venture to Pai Canyon, a dramatic landscape of narrow ridges and steep drop-offs that offers spectacular sunset views over the valley. The next morning, visit the famous Sai Ngam Hot Springs, natural mineral-rich pools surrounded by lush forest where you can soak your cares away. Explore Pai charming walking street with its eclectic mix of cafes, art galleries, and handicraft shops. Visit the iconic white Buddha statue at Wat Phra That Mae Yen, offering panoramic views of the town and surrounding mountains. Experience the vibrant Pai night market, sampling delicious local street food and handmade crafts. The tour also includes visits to local hill tribe communities where you can learn about their traditional way of life. Whether you are seeking adventure, relaxation, or cultural immersion, Pai offers a unique and unforgettable Thai experience that feels worlds away from the bustle of modern life.',
    destination: 'Pai, Mae Hong Son',
    duration: '2 Days 1 Night',
    days: 2,
    nights: 1,
    price: 4800,
    maxPax: 10,
    currentPax: 5,
    departureDate: '2024-05-20',
    status: 'published',
    category: 'Nature',
    highlights: ['Pai Canyon Sunset', 'Natural Hot Springs', 'Scenic Mountain Drive', 'Boutique Resort', 'Night Market'],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
    options: [
      {
        id: 'OPT-011-1',
        name: 'Standard Adventure',
        description: 'Includes round-trip transport, boutique accommodation, canyon visit, hot springs, and breakfast',
        quota: 10,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-011-1-1', minPax: 1, maxPax: 1, pricePerPerson: 5800 },
          { id: 'TIER-011-1-2', minPax: 2, maxPax: 3, pricePerPerson: 5200 },
          { id: 'TIER-011-1-3', minPax: 4, maxPax: null, pricePerPerson: 4800 }
        ]
      },
      {
        id: 'OPT-011-2',
        name: 'Premium with Private Pool Villa',
        description: 'Upgrade to private pool villa accommodation and additional spa treatment',
        quota: 4,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-011-2-1', minPax: 1, maxPax: 1, pricePerPerson: 7800 },
          { id: 'TIER-011-2-2', minPax: 2, maxPax: 3, pricePerPerson: 7200 },
          { id: 'TIER-011-2-3', minPax: 4, maxPax: null, pricePerPerson: 6800 }
        ]
      },
      {
        id: 'OPT-011-3',
        name: 'Motorbike Explorer',
        description: 'Includes motorbike rental for self-exploration, guided map, and all accommodation',
        quota: 6,
        isFlatRate: false,
        pricingTiers: [
          { id: 'TIER-011-3-1', minPax: 1, maxPax: 1, pricePerPerson: 5200 },
          { id: 'TIER-011-3-2', minPax: 2, maxPax: null, pricePerPerson: 4800 }
        ]
      }
    ]
  }
];
