import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .forEach((line) => {
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && value) process.env[key] = value;
    });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildDateRange() {
  const start = addDays(new Date(), 2);
  const end = addDays(start, 120);
  return {
    from: isoDate(start),
    to: isoDate(end),
  };
}

function buildTripTemplates(availableFrom, availableTo, slotRules) {
  const start = new Date(`${availableFrom}T00:00:00.000Z`);
  const end = new Date(`${availableTo}T00:00:00.000Z`);
  const map = new Map();

  for (let cursor = new Date(start.getTime()); cursor <= end; cursor = addDays(cursor, 1)) {
    const weekday = cursor.getUTCDay();
    const date = isoDate(cursor);
    for (const rule of slotRules) {
      if (DAY_INDEX[rule.day] !== weekday) continue;
      const time = /^\d{2}:\d{2}$/.test(rule.time) ? `${rule.time}:00` : rule.time;
      const key = `${date}|${time}`;
      const prev = map.get(key);
      const max = Math.max(1, Number(rule.max_pax || 1));
      if (!prev || max > prev.max_participants) {
        map.set(key, {
          date,
          time,
          status: "scheduled",
          max_participants: max,
          guide_name: null,
        });
      }
    }
  }

  return Array.from(map.values());
}

function defaultActivities(stops) {
  return [
    { time: "07:30", activity: "Hotel pickup", location: "Main pickup zone" },
    { time: "08:30", activity: "Pier check-in and safety briefing", location: "Departure pier" },
    ...stops,
    { time: "16:30", activity: "Return transfer to hotel", location: "Arrival pier" },
  ];
}

function buildTourDataset() {
  const { from, to } = buildDateRange();

  return [
    {
      code: "phi-phi-maya",
      tour: {
        name: "Phi Phi & Maya Bay Premium One-Day Speedboat",
        slug: "phi-phi-maya-bay-premium-one-day-speedboat",
        destination: "Phuket, Thailand",
        short_description: "A full-day island hopping experience to Maya Bay, Pileh Lagoon, and Khai Island.",
        description:
          "Explore the Andaman Sea highlights in one day with guided snorkeling, scenic viewpoints, and beach time. This route balances iconic landmarks with practical timing for comfort.",
        featured_image_url:
          "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["phuket", "phi phi", "maya bay", "one-day", "snorkeling"],
        meeting_point: "Royal Phuket Marina",
        meeting_point_map_url: "https://maps.google.com/?q=Royal+Phuket+Marina",
        duration_days: 1,
        duration_hours: 9,
        duration_text: "1 Day (9 hours)",
        min_pax: 1,
        max_pax: 20,
        is_private_tour: false,
        status: "published",
        meta_title: "Phi Phi and Maya Bay One-Day Tour from Phuket",
        meta_description: "Book a premium one-day speedboat tour to Phi Phi and Maya Bay with snorkeling and lunch.",
      },
      package: {
        category: "Nature",
        duration: "1 Day",
        base_price: 2790,
        max_pax: 20,
        highlights: [
          "Maya Bay and Pileh Lagoon photo stop",
          "Snorkeling at vibrant reef points",
          "Buffet lunch at Phi Phi Don",
          "Professional local guide",
        ],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "pp-join-standard",
            name: "Join Tour - Standard",
            description: "Shared speedboat trip with balanced itinerary and guided snorkeling.",
            groupType: "join",
            quota: 20,
            times: ["08:30", "09:00"],
            slotRules: [
              { day: "Mon", time: "08:30", max_pax: 20 },
              { day: "Wed", time: "08:30", max_pax: 20 },
              { day: "Fri", time: "08:30", max_pax: 20 },
              { day: "Sat", time: "09:00", max_pax: 20 },
            ],
            adultPrice: 2790,
            childPrice: 2290,
            infantPrice: 700,
            isFlatRate: false,
            pricingTiers: [
              { id: "pp-join-1", minPax: 1, maxPax: 4, pricePerPerson: 2790 },
              { id: "pp-join-2", minPax: 5, maxPax: 10, pricePerPerson: 2590 },
              { id: "pp-join-3", minPax: 11, maxPax: null, pricePerPerson: 2450 },
            ],
            perks: ["National park support", "Snorkeling gear", "Lunch"],
          },
          {
            id: "pp-private-charter",
            name: "Private Speedboat Charter",
            description: "Private charter with flexible pacing for your group only.",
            groupType: "private",
            quota: 10,
            times: ["08:00"],
            slotRules: [
              { day: "Tue", time: "08:00", max_pax: 10 },
              { day: "Thu", time: "08:00", max_pax: 10 },
              { day: "Sun", time: "08:00", max_pax: 10 },
            ],
            adultPrice: 26900,
            isFlatRate: true,
            flatRatePrice: 26900,
            pricingTiers: [{ id: "pp-private-1", minPax: 4, maxPax: 10, pricePerPerson: 0 }],
            perks: ["Private boat", "Custom pace", "Hotel transfer"],
          },
        ],
        policy_text:
          "Guests must follow marine conservation rules. Do not step on coral or feed marine animals.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "100% refund for weather cancellation by operator.",
        included_items: ["Hotel transfer", "Speedboat", "Lunch", "Insurance", "Guide"],
        excluded_items: ["National park fee", "Fins rental", "Personal expenses"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Phi Phi and Maya Bay Route",
          description:
            "Morning departure from Phuket, island-hopping through Phi Phi highlights, then return in the afternoon.",
          activities: defaultActivities([
            { time: "10:00", activity: "Maya Bay beach stop", location: "Maya Bay" },
            { time: "11:15", activity: "Swimming at Pileh Lagoon", location: "Pileh Lagoon" },
            { time: "12:30", activity: "Lunch and free walk", location: "Phi Phi Don" },
            { time: "14:00", activity: "Snorkeling stop", location: "Bamboo Island area" },
          ]),
        },
      ],
      addons: [
        { name: "GoPro Rental", description: "Underwater camera rental for the day", price: 500, is_per_person: false },
        { name: "Private Van Upgrade", description: "Roundtrip private transfer in Phuket", price: 1500, is_per_person: false },
      ],
    },
    {
      code: "krabi-4-islands",
      tour: {
        name: "Krabi 4 Islands One-Day Longtail Adventure",
        slug: "krabi-4-islands-one-day-longtail-adventure",
        destination: "Krabi, Thailand",
        short_description: "Visit Chicken Island, Tup Island, Poda Island, and Phra Nang Cave Beach in one day.",
        description:
          "A classic Krabi day route with scenic limestone cliffs, snorkeling areas, and beach relaxation windows.",
        featured_image_url:
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["krabi", "4 islands", "longtail", "beach"],
        meeting_point: "Nopparat Thara Pier",
        meeting_point_map_url: "https://maps.google.com/?q=Nopparat+Thara+Pier",
        duration_days: 1,
        duration_hours: 8,
        duration_text: "1 Day (8 hours)",
        min_pax: 1,
        max_pax: 22,
        is_private_tour: false,
        status: "published",
        meta_title: "Krabi 4 Islands Day Trip",
        meta_description: "Join a one-day longtail trip to Krabi 4 Islands with lunch and snorkeling.",
      },
      package: {
        category: "Adventure",
        duration: "1 Day",
        base_price: 1890,
        max_pax: 22,
        highlights: ["Chicken Island sandbank views", "Cave beach swim stop", "Thai set lunch", "Easy snorkeling"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "krabi-join",
            name: "Join Tour - Longtail",
            description: "Shared longtail route with island stop sequence based on tide.",
            groupType: "join",
            quota: 22,
            times: ["08:45"],
            slotRules: [
              { day: "Tue", time: "08:45", max_pax: 22 },
              { day: "Thu", time: "08:45", max_pax: 22 },
              { day: "Sat", time: "08:45", max_pax: 22 },
            ],
            adultPrice: 1890,
            childPrice: 1490,
            infantPrice: 500,
            isFlatRate: false,
            pricingTiers: [
              { id: "krabi-join-1", minPax: 1, maxPax: 5, pricePerPerson: 1890 },
              { id: "krabi-join-2", minPax: 6, maxPax: 12, pricePerPerson: 1750 },
              { id: "krabi-join-3", minPax: 13, maxPax: null, pricePerPerson: 1690 },
            ],
            perks: ["Longtail boat", "Lunch", "Snorkeling mask"],
          },
          {
            id: "krabi-private",
            name: "Private Longtail Charter",
            description: "Private longtail with flexible island stop duration.",
            groupType: "private",
            quota: 12,
            times: ["08:30"],
            slotRules: [
              { day: "Mon", time: "08:30", max_pax: 12 },
              { day: "Fri", time: "08:30", max_pax: 12 },
              { day: "Sun", time: "08:30", max_pax: 12 },
            ],
            adultPrice: 14500,
            isFlatRate: true,
            flatRatePrice: 14500,
            pricingTiers: [{ id: "krabi-private-1", minPax: 2, maxPax: 12, pricePerPerson: 0 }],
            perks: ["Private route", "No rush timing", "Dedicated guide"],
          },
        ],
        policy_text: "Subject to sea and tide conditions for safety and route ordering.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "Full refund for weather cancellation by operator.",
        included_items: ["Boat transfer", "Lunch", "Fruit and water", "Insurance"],
        excluded_items: ["National park fee", "Beach towel", "Tips"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Krabi Four Islands Circuit",
          description: "Boat loop around Ao Nang offshore islands with swim and beach windows.",
          activities: defaultActivities([
            { time: "10:00", activity: "Chicken Island viewpoint", location: "Chicken Island" },
            { time: "11:00", activity: "Sandbar walk and swim", location: "Tup Island" },
            { time: "12:30", activity: "Beach lunch", location: "Poda Island" },
            { time: "14:00", activity: "Cave beach stop", location: "Phra Nang" },
          ]),
        },
      ],
      addons: [
        { name: "Kayak Add-on", description: "30-minute guided kayak at beach stop", price: 450, is_per_person: true },
        { name: "Private Photographer", description: "Half-day travel photographer", price: 2800, is_per_person: false },
      ],
    },
    {
      code: "samui-ang-thong",
      tour: {
        name: "Koh Samui Ang Thong Marine Park Day Expedition",
        slug: "koh-samui-ang-thong-marine-park-day-expedition",
        destination: "Koh Samui, Thailand",
        short_description: "One-day speedboat tour to Ang Thong National Marine Park from Samui.",
        description:
          "Discover limestone islands, emerald lagoon viewpoints, and snorkeling points in a protected marine park setting.",
        featured_image_url:
          "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1526483360412-f4dbaf036963?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["samui", "ang thong", "marine park", "snorkeling"],
        meeting_point: "Bangrak Pier",
        meeting_point_map_url: "https://maps.google.com/?q=Bangrak+Pier+Koh+Samui",
        duration_days: 1,
        duration_hours: 9,
        duration_text: "1 Day (9 hours)",
        min_pax: 1,
        max_pax: 24,
        is_private_tour: false,
        status: "published",
        meta_title: "Ang Thong Marine Park Day Tour from Koh Samui",
        meta_description: "Join a one-day Ang Thong speedboat adventure with snorkeling and scenic viewpoints.",
      },
      package: {
        category: "Nature",
        duration: "1 Day",
        base_price: 2490,
        max_pax: 24,
        highlights: ["Emerald Lake viewpoint", "Marine park snorkeling", "Thai buffet lunch", "Hotel transfer"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "samui-join",
            name: "Join Tour - Marine Park",
            description: "Shared speedboat itinerary optimized for marine park timing.",
            groupType: "join",
            quota: 24,
            times: ["08:15"],
            slotRules: [
              { day: "Mon", time: "08:15", max_pax: 24 },
              { day: "Wed", time: "08:15", max_pax: 24 },
              { day: "Sat", time: "08:15", max_pax: 24 },
            ],
            adultPrice: 2490,
            childPrice: 1990,
            infantPrice: 650,
            isFlatRate: false,
            pricingTiers: [
              { id: "samui-join-1", minPax: 1, maxPax: 4, pricePerPerson: 2490 },
              { id: "samui-join-2", minPax: 5, maxPax: 10, pricePerPerson: 2350 },
              { id: "samui-join-3", minPax: 11, maxPax: null, pricePerPerson: 2250 },
            ],
            perks: ["National marine park route", "Lunch", "Guide"],
          },
          {
            id: "samui-private",
            name: "Private Speedboat - Ang Thong",
            description: "Private speedboat with custom photo and swim timing.",
            groupType: "private",
            quota: 15,
            times: ["08:00"],
            slotRules: [
              { day: "Tue", time: "08:00", max_pax: 15 },
              { day: "Thu", time: "08:00", max_pax: 15 },
              { day: "Sun", time: "08:00", max_pax: 15 },
            ],
            adultPrice: 31000,
            isFlatRate: true,
            flatRatePrice: 31000,
            pricingTiers: [{ id: "samui-private-1", minPax: 4, maxPax: 15, pricePerPerson: 0 }],
            perks: ["Private vessel", "Flexible pace", "Priority stop windows"],
          },
        ],
        policy_text: "National park authorities may adjust stop sequence by sea conditions.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "Full refund for operator weather cancellation.",
        included_items: ["Roundtrip transfer", "Boat", "Lunch", "Insurance", "Guide"],
        excluded_items: ["Park fee", "Sea-sickness medication", "Tips"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Ang Thong Marine Park Loop",
          description: "Island viewpoints, kayaking window, and snorkeling stops with lunch in the park.",
          activities: defaultActivities([
            { time: "10:15", activity: "Emerald Lake climb and viewpoint", location: "Ko Mae Ko" },
            { time: "12:00", activity: "Lunch and beach break", location: "Marine Park Base Island" },
            { time: "13:30", activity: "Snorkeling", location: "Wua Ta Lap area" },
            { time: "15:00", activity: "Scenic cruise", location: "Ang Thong archipelago" },
          ]),
        },
      ],
      addons: [
        { name: "Sea Kayak Session", description: "Guided kayak route in protected bay", price: 600, is_per_person: true },
        { name: "Drone Footage", description: "Edited short cinematic clip", price: 3200, is_per_person: false },
      ],
    },
    {
      code: "koh-tao-nangyuan",
      tour: {
        name: "Koh Tao & Nang Yuan One-Day Snorkeling Escape",
        slug: "koh-tao-nang-yuan-one-day-snorkeling-escape",
        destination: "Koh Tao, Thailand",
        short_description: "Day trip covering Koh Tao bays and Koh Nang Yuan sandbar viewpoint.",
        description:
          "Ideal for reef snorkeling and clear-water swimming with guided support and efficient transfers.",
        featured_image_url:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["koh tao", "nang yuan", "snorkeling", "one-day"],
        meeting_point: "Mae Haad Pier",
        meeting_point_map_url: "https://maps.google.com/?q=Mae+Haad+Pier+Koh+Tao",
        duration_days: 1,
        duration_hours: 8,
        duration_text: "1 Day (8 hours)",
        min_pax: 1,
        max_pax: 18,
        is_private_tour: false,
        status: "published",
        meta_title: "Koh Tao and Nang Yuan Snorkeling Day Tour",
        meta_description: "Book a Koh Tao and Nang Yuan day trip with snorkeling gear and lunch included.",
      },
      package: {
        category: "Nature",
        duration: "1 Day",
        base_price: 2190,
        max_pax: 18,
        highlights: ["Nang Yuan viewpoint", "Three snorkel points", "Small-group pacing", "Lunch included"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "tao-join",
            name: "Join Tour - Snorkeling",
            description: "Shared snorkeling route with reef-focused schedule.",
            groupType: "join",
            quota: 18,
            times: ["09:00"],
            slotRules: [
              { day: "Tue", time: "09:00", max_pax: 18 },
              { day: "Thu", time: "09:00", max_pax: 18 },
              { day: "Sat", time: "09:00", max_pax: 18 },
            ],
            adultPrice: 2190,
            childPrice: 1790,
            infantPrice: 600,
            isFlatRate: false,
            pricingTiers: [
              { id: "tao-join-1", minPax: 1, maxPax: 4, pricePerPerson: 2190 },
              { id: "tao-join-2", minPax: 5, maxPax: 10, pricePerPerson: 2050 },
              { id: "tao-join-3", minPax: 11, maxPax: null, pricePerPerson: 1950 },
            ],
            perks: ["Snorkeling gear", "Lunch", "Fruit break"],
          },
          {
            id: "tao-private",
            name: "Private Snorkeling Charter",
            description: "Private boat for family or friends with flexible snorkel windows.",
            groupType: "private",
            quota: 10,
            times: ["08:45"],
            slotRules: [
              { day: "Mon", time: "08:45", max_pax: 10 },
              { day: "Fri", time: "08:45", max_pax: 10 },
              { day: "Sun", time: "08:45", max_pax: 10 },
            ],
            adultPrice: 19800,
            isFlatRate: true,
            flatRatePrice: 19800,
            pricingTiers: [{ id: "tao-private-1", minPax: 2, maxPax: 10, pricePerPerson: 0 }],
            perks: ["Private boat", "Flexible route", "Custom timing"],
          },
        ],
        policy_text: "Reef-safe sunscreen is recommended. Coral contact is prohibited.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "Full refund if operator cancels due to weather or sea conditions.",
        included_items: ["Boat", "Guide", "Lunch", "Snorkeling gear", "Insurance"],
        excluded_items: ["Nang Yuan entry fee", "Towel", "Personal expenses"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Koh Tao Reef and Nang Yuan Circuit",
          description: "Multiple snorkel bays and iconic sandbar stop with return in late afternoon.",
          activities: defaultActivities([
            { time: "10:00", activity: "Shallow reef snorkeling", location: "Ao Leuk" },
            { time: "11:30", activity: "Beach break", location: "Koh Nang Yuan" },
            { time: "12:30", activity: "Lunch", location: "Nang Yuan area" },
            { time: "14:00", activity: "Second snorkeling stop", location: "Mango Bay" },
          ]),
        },
      ],
      addons: [
        { name: "Premium Mask Set", description: "Upgraded anti-fog mask and snorkel", price: 250, is_per_person: true },
        { name: "Private Guide", description: "Dedicated in-water guide support", price: 1900, is_per_person: false },
      ],
    },
    {
      code: "similan-daytrip",
      tour: {
        name: "Similan Islands One-Day Speedboat from Khao Lak",
        slug: "similan-islands-one-day-speedboat-from-khao-lak",
        destination: "Khao Lak, Thailand",
        short_description: "Full-day Similan route with crystal-clear water snorkeling sites.",
        description:
          "A practical day plan to Similan Islands for snorkeling, beach time, and viewpoint visits during open season.",
        featured_image_url:
          "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["similan", "khao lak", "snorkeling", "islands"],
        meeting_point: "Tablamu Pier",
        meeting_point_map_url: "https://maps.google.com/?q=Tablamu+Pier",
        duration_days: 1,
        duration_hours: 10,
        duration_text: "1 Day (10 hours)",
        min_pax: 1,
        max_pax: 22,
        is_private_tour: false,
        status: "published",
        meta_title: "Similan Islands Day Trip from Khao Lak",
        meta_description: "Experience Similan Islands in one day with snorkeling and lunch included.",
      },
      package: {
        category: "Nature",
        duration: "1 Day",
        base_price: 3290,
        max_pax: 22,
        highlights: ["Open-sea speedboat ride", "Similan viewpoints", "Two snorkel sessions", "Lunch box"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "similan-join",
            name: "Join Tour - Similan",
            description: "Shared high-speed route to key Similan snorkeling points.",
            groupType: "join",
            quota: 22,
            times: ["07:30"],
            slotRules: [
              { day: "Mon", time: "07:30", max_pax: 22 },
              { day: "Tue", time: "07:30", max_pax: 22 },
              { day: "Thu", time: "07:30", max_pax: 22 },
              { day: "Sat", time: "07:30", max_pax: 22 },
            ],
            adultPrice: 3290,
            childPrice: 2790,
            infantPrice: 900,
            isFlatRate: false,
            pricingTiers: [
              { id: "similan-join-1", minPax: 1, maxPax: 4, pricePerPerson: 3290 },
              { id: "similan-join-2", minPax: 5, maxPax: 10, pricePerPerson: 3150 },
              { id: "similan-join-3", minPax: 11, maxPax: null, pricePerPerson: 2990 },
            ],
            perks: ["National park route", "Snorkel set", "Lunch box"],
          },
          {
            id: "similan-private",
            name: "Private Similan Charter",
            description: "Private premium charter for dedicated small groups.",
            groupType: "private",
            quota: 12,
            times: ["07:15"],
            slotRules: [
              { day: "Wed", time: "07:15", max_pax: 12 },
              { day: "Fri", time: "07:15", max_pax: 12 },
              { day: "Sun", time: "07:15", max_pax: 12 },
            ],
            adultPrice: 42000,
            isFlatRate: true,
            flatRatePrice: 42000,
            pricingTiers: [{ id: "similan-private-1", minPax: 4, maxPax: 12, pricePerPerson: 0 }],
            perks: ["Private speedboat", "Flexible snorkel windows", "Dedicated crew"],
          },
        ],
        policy_text: "Similan trips operate seasonally and depend on marine authority guidance.",
        cancellation_policy: "Free cancellation up to 48 hours before departure.",
        refund_policy: "Full refund for weather or marine authority closure.",
        included_items: ["Roundtrip transfer", "Boat", "Lunch", "Snorkel gear", "Insurance"],
        excluded_items: ["National park fee", "Fins", "Personal camera rental"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Similan Highlights Route",
          description: "Long-range speedboat route with key viewpoint and snorkeling stops.",
          activities: defaultActivities([
            { time: "10:30", activity: "Viewpoint and beach stop", location: "Island No. 8" },
            { time: "12:00", activity: "Lunch break", location: "Island No. 4" },
            { time: "13:15", activity: "Snorkeling stop 1", location: "Island No. 7" },
            { time: "14:30", activity: "Snorkeling stop 2", location: "Island No. 9" },
          ]),
        },
      ],
      addons: [
        { name: "Fins Rental", description: "Full-day fins rental", price: 200, is_per_person: true },
        { name: "Priority Transfer", description: "Direct van pickup without shared stops", price: 1200, is_per_person: false },
      ],
    },
    {
      code: "koh-lipe",
      tour: {
        name: "Koh Lipe One-Day Inner Islands Snorkeling",
        slug: "koh-lipe-one-day-inner-islands-snorkeling",
        destination: "Koh Lipe, Thailand",
        short_description: "One-day snorkeling around Koh Lipe and nearby inner islands.",
        description:
          "Calmer routes designed for mixed groups with beach and snorkeling balance close to Koh Lipe.",
        featured_image_url:
          "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["koh lipe", "snorkeling", "island hopping", "satun"],
        meeting_point: "Pattaya Beach Meeting Point",
        meeting_point_map_url: "https://maps.google.com/?q=Pattaya+Beach+Koh+Lipe",
        duration_days: 1,
        duration_hours: 7,
        duration_text: "1 Day (7 hours)",
        min_pax: 1,
        max_pax: 16,
        is_private_tour: false,
        status: "published",
        meta_title: "Koh Lipe One-Day Snorkeling Tour",
        meta_description: "Explore Koh Lipe inner islands in one day with snorkeling and beach stops.",
      },
      package: {
        category: "Relaxation",
        duration: "1 Day",
        base_price: 1990,
        max_pax: 16,
        highlights: ["Calm-water snorkeling", "Beach relaxation stops", "Local guide", "Family-friendly pace"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "lipe-join",
            name: "Join Tour - Easy Snorkel",
            description: "Shared longtail route with easy-entry snorkeling points.",
            groupType: "join",
            quota: 16,
            times: ["09:15"],
            slotRules: [
              { day: "Mon", time: "09:15", max_pax: 16 },
              { day: "Wed", time: "09:15", max_pax: 16 },
              { day: "Fri", time: "09:15", max_pax: 16 },
              { day: "Sun", time: "09:15", max_pax: 16 },
            ],
            adultPrice: 1990,
            childPrice: 1590,
            infantPrice: 500,
            isFlatRate: false,
            pricingTiers: [
              { id: "lipe-join-1", minPax: 1, maxPax: 4, pricePerPerson: 1990 },
              { id: "lipe-join-2", minPax: 5, maxPax: 10, pricePerPerson: 1850 },
              { id: "lipe-join-3", minPax: 11, maxPax: null, pricePerPerson: 1790 },
            ],
            perks: ["Longtail boat", "Drinking water", "Snorkeling gear"],
          },
          {
            id: "lipe-private",
            name: "Private Island Charter",
            description: "Private boat charter for couples, families, or friends.",
            groupType: "private",
            quota: 8,
            times: ["09:00"],
            slotRules: [
              { day: "Tue", time: "09:00", max_pax: 8 },
              { day: "Thu", time: "09:00", max_pax: 8 },
              { day: "Sat", time: "09:00", max_pax: 8 },
            ],
            adultPrice: 11800,
            isFlatRate: true,
            flatRatePrice: 11800,
            pricingTiers: [{ id: "lipe-private-1", minPax: 2, maxPax: 8, pricePerPerson: 0 }],
            perks: ["Private boat", "Flexible beach stops", "Custom photo stops"],
          },
        ],
        policy_text: "Routes may be adjusted by sea conditions and marine safety advisories.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "Operator weather cancellation is fully refundable.",
        included_items: ["Boat", "Guide", "Water", "Snorkeling gear", "Insurance"],
        excluded_items: ["National park fee", "Lunch", "Tips"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Koh Lipe Inner Islands Day Route",
          description: "Shorter sailing distances with multiple swim and snorkel breaks.",
          activities: defaultActivities([
            { time: "10:00", activity: "First snorkeling stop", location: "Jabang Reef" },
            { time: "11:30", activity: "Beach free time", location: "Koh Adang beach" },
            { time: "12:30", activity: "Local lunch stop", location: "Koh Rawi area" },
            { time: "14:00", activity: "Second snorkeling stop", location: "Koh Hin Ngam" },
          ]),
        },
      ],
      addons: [
        { name: "Beach Picnic Set", description: "Premium picnic setup for one stop", price: 900, is_per_person: false },
        { name: "Marine Life Guidebook", description: "Pocket reef identification guide", price: 150, is_per_person: true },
      ],
    },
    {
      code: "phangnga-hong",
      tour: {
        name: "Phang Nga & Hong Island One-Day Sea Canoe Journey",
        slug: "phang-nga-and-hong-island-one-day-sea-canoe-journey",
        destination: "Phang Nga, Thailand",
        short_description: "One-day route to sea caves and Hong Island with canoe and sightseeing.",
        description:
          "A mixed-activity day trip combining gentle canoe exploration and classic limestone island scenery.",
        featured_image_url:
          "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["phang nga", "hong island", "sea canoe", "limestone"],
        meeting_point: "Ao Por Grand Marina",
        meeting_point_map_url: "https://maps.google.com/?q=Ao+Por+Grand+Marina",
        duration_days: 1,
        duration_hours: 8,
        duration_text: "1 Day (8 hours)",
        min_pax: 1,
        max_pax: 20,
        is_private_tour: false,
        status: "published",
        meta_title: "Phang Nga Bay and Hong Island Day Trip",
        meta_description: "Join a day trip to Phang Nga Bay and Hong Island with sea canoe activity.",
      },
      package: {
        category: "Adventure",
        duration: "1 Day",
        base_price: 2590,
        max_pax: 20,
        highlights: ["Sea cave canoe", "Hong Island lagoon", "James Bond photo stop", "Lunch onboard"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "phangnga-join",
            name: "Join Tour - Canoe Explorer",
            description: "Shared route with guided canoe paddlers at cave zones.",
            groupType: "join",
            quota: 20,
            times: ["08:20"],
            slotRules: [
              { day: "Mon", time: "08:20", max_pax: 20 },
              { day: "Thu", time: "08:20", max_pax: 20 },
              { day: "Sat", time: "08:20", max_pax: 20 },
            ],
            adultPrice: 2590,
            childPrice: 2090,
            infantPrice: 700,
            isFlatRate: false,
            pricingTiers: [
              { id: "phangnga-join-1", minPax: 1, maxPax: 4, pricePerPerson: 2590 },
              { id: "phangnga-join-2", minPax: 5, maxPax: 10, pricePerPerson: 2450 },
              { id: "phangnga-join-3", minPax: 11, maxPax: null, pricePerPerson: 2350 },
            ],
            perks: ["Canoe activity", "Lunch", "Guide"],
          },
          {
            id: "phangnga-private",
            name: "Private Bay Charter",
            description: "Private charter for cave and lagoon sightseeing itinerary.",
            groupType: "private",
            quota: 12,
            times: ["08:00"],
            slotRules: [
              { day: "Tue", time: "08:00", max_pax: 12 },
              { day: "Fri", time: "08:00", max_pax: 12 },
              { day: "Sun", time: "08:00", max_pax: 12 },
            ],
            adultPrice: 29800,
            isFlatRate: true,
            flatRatePrice: 29800,
            pricingTiers: [{ id: "phangnga-private-1", minPax: 4, maxPax: 12, pricePerPerson: 0 }],
            perks: ["Private route", "Flexible timing", "Dedicated crew"],
          },
        ],
        policy_text: "Cave access depends on tide level and safety checks.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "100% refund for weather cancellation by operator.",
        included_items: ["Transfer", "Boat", "Lunch", "Canoe paddler", "Insurance"],
        excluded_items: ["National park fee", "Personal snacks", "Tips"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Phang Nga Cave and Lagoon Route",
          description: "Sea-canoe cave entries, lagoon views, and iconic bay stops.",
          activities: defaultActivities([
            { time: "10:00", activity: "Canoe cave entry", location: "Panak Island" },
            { time: "11:30", activity: "Hong lagoon paddle", location: "Hong Island" },
            { time: "12:45", activity: "Lunch", location: "Onboard" },
            { time: "14:00", activity: "Scenic stop", location: "James Bond Island" },
          ]),
        },
      ],
      addons: [
        { name: "Premium Front Seat", description: "Priority seating zone on speedboat", price: 300, is_per_person: true },
        { name: "Seafood Lunch Upgrade", description: "Premium lunch menu option", price: 450, is_per_person: true },
      ],
    },
    {
      code: "surin-daytrip",
      tour: {
        name: "Surin Islands One-Day Snorkeling Discovery",
        slug: "surin-islands-one-day-snorkeling-discovery",
        destination: "Surin Islands, Thailand",
        short_description: "One-day snorkel-focused route in Surin Islands with clear reef waters.",
        description:
          "Built for reef visibility and relaxed pacing with two to three snorkeling sessions and beach downtime.",
        featured_image_url:
          "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["surin", "snorkeling", "marine park", "day trip"],
        meeting_point: "Kuraburi Pier",
        meeting_point_map_url: "https://maps.google.com/?q=Kuraburi+Pier",
        duration_days: 1,
        duration_hours: 10,
        duration_text: "1 Day (10 hours)",
        min_pax: 1,
        max_pax: 20,
        is_private_tour: false,
        status: "published",
        meta_title: "Surin Islands One-Day Snorkeling Trip",
        meta_description: "Book a Surin Islands snorkeling day trip with lunch and guided reef stops.",
      },
      package: {
        category: "Nature",
        duration: "1 Day",
        base_price: 3390,
        max_pax: 20,
        highlights: ["High-visibility reefs", "Marine park beach", "Thai lunch", "Experienced guide"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "surin-join",
            name: "Join Tour - Reef Focus",
            description: "Shared speedboat route with extended reef time.",
            groupType: "join",
            quota: 20,
            times: ["07:20"],
            slotRules: [
              { day: "Mon", time: "07:20", max_pax: 20 },
              { day: "Wed", time: "07:20", max_pax: 20 },
              { day: "Fri", time: "07:20", max_pax: 20 },
            ],
            adultPrice: 3390,
            childPrice: 2890,
            infantPrice: 900,
            isFlatRate: false,
            pricingTiers: [
              { id: "surin-join-1", minPax: 1, maxPax: 4, pricePerPerson: 3390 },
              { id: "surin-join-2", minPax: 5, maxPax: 10, pricePerPerson: 3250 },
              { id: "surin-join-3", minPax: 11, maxPax: null, pricePerPerson: 3090 },
            ],
            perks: ["Long reef sessions", "Lunch", "Snorkel set"],
          },
          {
            id: "surin-private",
            name: "Private Reef Charter",
            description: "Private speedboat option for focused snorkeling groups.",
            groupType: "private",
            quota: 12,
            times: ["07:00"],
            slotRules: [
              { day: "Tue", time: "07:00", max_pax: 12 },
              { day: "Thu", time: "07:00", max_pax: 12 },
              { day: "Sun", time: "07:00", max_pax: 12 },
            ],
            adultPrice: 43500,
            isFlatRate: true,
            flatRatePrice: 43500,
            pricingTiers: [{ id: "surin-private-1", minPax: 4, maxPax: 12, pricePerPerson: 0 }],
            perks: ["Private itinerary", "Dedicated crew", "Flexible snorkel windows"],
          },
        ],
        policy_text: "Marine conservation rules are strictly enforced in Surin Islands.",
        cancellation_policy: "Free cancellation up to 48 hours before departure.",
        refund_policy: "Full refund for official closure or unsafe sea conditions.",
        included_items: ["Roundtrip transfer", "Boat", "Lunch", "Guide", "Insurance"],
        excluded_items: ["National park fee", "Fins", "Camera rental"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Surin Reef Day Route",
          description: "Long-distance speedboat trip with multiple high-quality reef sessions.",
          activities: defaultActivities([
            { time: "10:30", activity: "Snorkeling stop 1", location: "Chong Kad Bay" },
            { time: "12:00", activity: "Lunch and beach break", location: "Mu Ko Surin" },
            { time: "13:30", activity: "Snorkeling stop 2", location: "Ao Mae Yai" },
            { time: "14:45", activity: "Snorkeling stop 3", location: "Boulder reef" },
          ]),
        },
      ],
      addons: [
        { name: "Marine Life Briefing", description: "Extended marine ecology briefing", price: 250, is_per_person: true },
        { name: "Private Pickup Van", description: "Exclusive transfer from Khao Lak", price: 1300, is_per_person: false },
      ],
    },
    {
      code: "koh-yao-hong",
      tour: {
        name: "Koh Yao & Hong Islands One-Day Scenic Cruise",
        slug: "koh-yao-and-hong-islands-one-day-scenic-cruise",
        destination: "Koh Yao Noi, Thailand",
        short_description: "One-day sea route between Koh Yao and Hong Islands with swim and sightseeing stops.",
        description:
          "A scenic route for travelers who prefer balanced relaxation and light activity around dramatic limestone bays.",
        featured_image_url:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
        gallery_image_urls: [
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
        ],
        tags: ["koh yao", "hong islands", "scenic", "one-day"],
        meeting_point: "Manoh Pier",
        meeting_point_map_url: "https://maps.google.com/?q=Manoh+Pier+Koh+Yao+Noi",
        duration_days: 1,
        duration_hours: 8,
        duration_text: "1 Day (8 hours)",
        min_pax: 1,
        max_pax: 18,
        is_private_tour: false,
        status: "published",
        meta_title: "Koh Yao and Hong Islands Day Cruise",
        meta_description: "Book a one-day scenic cruise to Koh Yao and Hong Islands with lunch and guide.",
      },
      package: {
        category: "Relaxation",
        duration: "1 Day",
        base_price: 2290,
        max_pax: 18,
        highlights: ["Scenic limestone bays", "Easy snorkeling", "Beach lunch", "Relaxed pacing"],
      },
      options: {
        available_from: from,
        available_to: to,
        list: [
          {
            id: "yao-join",
            name: "Join Tour - Scenic Route",
            description: "Shared speedboat route with long scenic windows.",
            groupType: "join",
            quota: 18,
            times: ["09:10"],
            slotRules: [
              { day: "Mon", time: "09:10", max_pax: 18 },
              { day: "Thu", time: "09:10", max_pax: 18 },
              { day: "Sat", time: "09:10", max_pax: 18 },
            ],
            adultPrice: 2290,
            childPrice: 1890,
            infantPrice: 600,
            isFlatRate: false,
            pricingTiers: [
              { id: "yao-join-1", minPax: 1, maxPax: 4, pricePerPerson: 2290 },
              { id: "yao-join-2", minPax: 5, maxPax: 10, pricePerPerson: 2150 },
              { id: "yao-join-3", minPax: 11, maxPax: null, pricePerPerson: 2050 },
            ],
            perks: ["Scenic route", "Lunch", "Guide"],
          },
          {
            id: "yao-private",
            name: "Private Scenic Charter",
            description: "Private charter designed for flexible photo and swim timing.",
            groupType: "private",
            quota: 10,
            times: ["09:00"],
            slotRules: [
              { day: "Tue", time: "09:00", max_pax: 10 },
              { day: "Fri", time: "09:00", max_pax: 10 },
              { day: "Sun", time: "09:00", max_pax: 10 },
            ],
            adultPrice: 18200,
            isFlatRate: true,
            flatRatePrice: 18200,
            pricingTiers: [{ id: "yao-private-1", minPax: 2, maxPax: 10, pricePerPerson: 0 }],
            perks: ["Private route", "Flexible timing", "Dedicated crew"],
          },
        ],
        policy_text: "Timing may shift to optimize tide and anchoring conditions.",
        cancellation_policy: "Free cancellation up to 24 hours before departure.",
        refund_policy: "Full refund for operator weather cancellation.",
        included_items: ["Boat", "Lunch", "Water", "Guide", "Insurance"],
        excluded_items: ["National park fee", "Personal snacks", "Tips"],
      },
      itinerary: [
        {
          day_number: 1,
          title: "Koh Yao and Hong Islands Day Loop",
          description: "Scenic day route with swim windows and beach lunch.",
          activities: defaultActivities([
            { time: "10:00", activity: "Lagoon sightseeing", location: "Hong Lagoon" },
            { time: "11:30", activity: "Snorkeling", location: "Lading Island" },
            { time: "12:45", activity: "Beach lunch", location: "Hong Island" },
            { time: "14:30", activity: "Relaxed swim stop", location: "Koh Yao coast" },
          ]),
        },
      ],
      addons: [
        { name: "Premium Picnic Basket", description: "Upgraded beach picnic menu", price: 700, is_per_person: false },
        { name: "Extra Snorkel Stop", description: "Additional short snorkel session", price: 350, is_per_person: true },
      ],
    },
  ];
}

function buildMetaOption(source, from, to) {
  const reviews = [
    {
      id: `${source.code}-r1`,
      user: "Liam Carter",
      date: "Feb 03, 2026",
      rating: 5,
      content: "Great timing and smooth logistics. The guide gave clear instructions and we had enough stop time.",
      avatar: "LC",
    },
    {
      id: `${source.code}-r2`,
      user: "Sofia Tan",
      date: "Jan 18, 2026",
      rating: 4,
      content: "Well-organized route and friendly crew. Snorkeling spots were nice and easy for beginners.",
      avatar: "ST",
    },
  ];

  return {
    id: "__meta__",
    name: "__meta__",
    description: "internal content metadata",
    quota: 0,
    isFlatRate: false,
    pricingTiers: [],
    meta: {
      available_from: from,
      available_to: to,
      policy_text: source.options.policy_text,
      cancellation_policy: source.options.cancellation_policy,
      refund_policy: source.options.refund_policy,
      included_items: source.options.included_items,
      excluded_items: source.options.excluded_items,
      duration_text: source.tour.duration_text,
      group_size_text: `Join up to ${source.package.max_pax} guests • Private up to 12 guests`,
      age_range: "All ages",
      languages: ["English", "Thai"],
      badge_text: "One-Day Bestseller",
      badge_variant: "warning",
      rating: 4.8,
      reviews_count: 168,
      faq: [
        {
          question: "Do I need previous snorkeling experience?",
          answer: "No. Beginners are welcome, and the guide provides a basic safety briefing before entering the water.",
        },
        {
          question: "What should I bring?",
          answer: "Bring swimwear, towel, sun protection, and a dry set of clothes for the return transfer.",
        },
      ],
      reviews,
    },
  };
}

function buildPackageOptions(source) {
  const from = source.options.available_from;
  const to = source.options.available_to;
  return [...source.options.list, buildMetaOption(source, from, to)];
}

function buildTicketTypes() {
  return [
    { name: "Adult", code: "ADT", description: "Ages 13+", min_age: 13, max_age: null, sort_order: 1 },
    { name: "Child", code: "CHD", description: "Ages 3-12", min_age: 3, max_age: 12, sort_order: 2 },
    { name: "Infant", code: "INF", description: "Ages 0-2", min_age: 0, max_age: 2, sort_order: 3 },
  ];
}

function pickPrimaryJoinOption(options) {
  return options.find((o) => o.groupType === "join") || options[0];
}

function pickPrimaryPrivateOption(options) {
  return options.find((o) => o.groupType === "private") || null;
}

async function ensureCategoryId() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", ["nature", "adventure", "relaxation"])
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Load categories failed: ${error.message}`);
  if (!data || data.length === 0) throw new Error("No category rows found in categories table");
  return data[0].id;
}

async function upsertTourBase(categoryId, source) {
  const payload = {
    ...source.tour,
    category_id: categoryId,
    published_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("tours")
    .upsert(payload, { onConflict: "slug" })
    .select("id, slug, destination")
    .single();

  if (error) throw new Error(`Upsert tour ${source.tour.slug} failed: ${error.message}`);
  return data;
}

async function replaceTourDetails(tourId, source) {
  await supabase.from("tour_itinerary").delete().eq("tour_id", tourId);
  await supabase.from("tour_inclusions").delete().eq("tour_id", tourId);
  await supabase.from("tour_addons").delete().eq("tour_id", tourId);
  await supabase.from("tour_policies").delete().eq("tour_id", tourId);

  const itineraryRows = source.itinerary.map((row, idx) => ({
    tour_id: tourId,
    day_number: row.day_number,
    title: row.title,
    description: row.description,
    activities: row.activities,
    meals: ["Lunch"],
    accommodation_name: null,
    accommodation_description: null,
    sort_order: idx,
  }));

  const inclusionRows = [
    ...source.options.included_items.map((item, idx) => ({
      tour_id: tourId,
      item,
      is_included: true,
      sort_order: idx,
    })),
    ...source.options.excluded_items.map((item, idx) => ({
      tour_id: tourId,
      item,
      is_included: false,
      sort_order: source.options.included_items.length + idx,
    })),
  ];

  const addonRows = source.addons.map((row, idx) => ({
    tour_id: tourId,
    name: row.name,
    description: row.description,
    price: row.price,
    is_per_person: row.is_per_person,
    max_quantity: row.is_per_person ? 10 : 1,
    is_active: true,
    sort_order: idx,
  }));

  const policyRows = [
    {
      tour_id: tourId,
      policy_type: "other",
      title: "Requirements",
      description: "Guests should be comfortable on boats and follow guide instructions.",
      hours_before: null,
      refund_percentage: null,
      sort_order: 1,
    },
    {
      tour_id: tourId,
      policy_type: "cancellation",
      title: "Cancellation Policy",
      description: source.options.cancellation_policy,
      hours_before: 24,
      refund_percentage: 100,
      sort_order: 2,
    },
    {
      tour_id: tourId,
      policy_type: "refund",
      title: "Refund Policy",
      description: source.options.refund_policy,
      hours_before: null,
      refund_percentage: 100,
      sort_order: 3,
    },
    {
      tour_id: tourId,
      policy_type: "weather",
      title: "Weather Policy",
      description: "Operator may adjust route, delay, or cancel for safety if sea conditions are unsuitable.",
      hours_before: null,
      refund_percentage: 100,
      sort_order: 4,
    },
  ];

  if (itineraryRows.length > 0) {
    const { error } = await supabase.from("tour_itinerary").insert(itineraryRows);
    if (error) throw new Error(`Insert itinerary failed (${source.code}): ${error.message}`);
  }

  if (inclusionRows.length > 0) {
    const { error } = await supabase.from("tour_inclusions").insert(inclusionRows);
    if (error) throw new Error(`Insert inclusions failed (${source.code}): ${error.message}`);
  }

  if (addonRows.length > 0) {
    const { error } = await supabase.from("tour_addons").insert(addonRows);
    if (error) throw new Error(`Insert addons failed (${source.code}): ${error.message}`);
  }

  if (policyRows.length > 0) {
    const { error } = await supabase.from("tour_policies").insert(policyRows);
    if (error) throw new Error(`Insert policies failed (${source.code}): ${error.message}`);
  }
}

async function replaceSchedulesAndPricing(tourId, source) {
  await supabase.from("tour_schedules").delete().eq("tour_id", tourId);
  await supabase.from("ticket_types").delete().eq("tour_id", tourId);

  const ticketTypeRows = buildTicketTypes().map((row) => ({
    tour_id: tourId,
    name: row.name,
    code: row.code,
    description: row.description,
    sort_order: row.sort_order,
    min_age: row.min_age,
    max_age: row.max_age,
    requires_id_proof: false,
    max_quantity_per_booking: 20,
    is_active: true,
  }));

  const { data: ticketTypes, error: ticketTypeErr } = await supabase
    .from("ticket_types")
    .insert(ticketTypeRows)
    .select("id, code");
  if (ticketTypeErr) throw new Error(`Insert ticket types failed (${source.code}): ${ticketTypeErr.message}`);

  const joinOption = pickPrimaryJoinOption(source.options.list);
  const privateOption = pickPrimaryPrivateOption(source.options.list);

  const slotRules = joinOption?.slotRules || [];
  const templates = buildTripTemplates(source.options.available_from, source.options.available_to, slotRules).slice(0, 20);

  const scheduleRows = templates.map((item) => ({
    tour_id: tourId,
    start_date: item.date,
    start_time: item.time,
    end_date: item.date,
    end_time: "17:00:00",
    total_capacity: Math.max(0, item.max_participants),
    available_capacity: Math.max(0, item.max_participants),
    status: "open",
    has_special_price: false,
    special_price_note: null,
    booking_cutoff_hours: 12,
  }));

  const { data: schedules, error: scheduleErr } = await supabase
    .from("tour_schedules")
    .insert(scheduleRows)
    .select("id");
  if (scheduleErr) throw new Error(`Insert schedules failed (${source.code}): ${scheduleErr.message}`);

  const typeByCode = new Map((ticketTypes || []).map((t) => [t.code, t.id]));
  const adt = typeByCode.get("ADT");
  const chd = typeByCode.get("CHD");
  const inf = typeByCode.get("INF");
  if (!adt || !chd || !inf) throw new Error(`Ticket type mapping incomplete for ${source.code}`);

  const adultPrice = Number(joinOption?.adultPrice || source.package.base_price);
  const childPrice = Number(joinOption?.childPrice || Math.max(0, adultPrice - 400));
  const infantPrice = Number(joinOption?.infantPrice || 500);
  void privateOption;

  const pricingRows = [];
  for (const schedule of schedules || []) {
    pricingRows.push(
      {
        schedule_id: schedule.id,
        ticket_type_id: adt,
        base_price: adultPrice,
        sale_price: null,
        currency: "THB",
        quantity_available: source.package.max_pax,
        valid_from: null,
        valid_until: null,
      },
      {
        schedule_id: schedule.id,
        ticket_type_id: chd,
        base_price: childPrice,
        sale_price: null,
        currency: "THB",
        quantity_available: source.package.max_pax,
        valid_from: null,
        valid_until: null,
      },
      {
        schedule_id: schedule.id,
        ticket_type_id: inf,
        base_price: infantPrice,
        sale_price: null,
        currency: "THB",
        quantity_available: source.package.max_pax,
        valid_from: null,
        valid_until: null,
      }
    );

  }

  const { error: pricingErr } = await supabase.from("ticket_pricing").insert(pricingRows);
  if (pricingErr) {
    throw new Error(`Insert pricing failed (${source.code}): ${pricingErr.message}`);
  }
}

async function upsertPackageAndTrips(source) {
  const options = buildPackageOptions(source);

  const packagePayload = {
    name: source.tour.name,
    description: source.tour.description,
    destination: source.tour.destination,
    duration: source.package.duration,
    base_price: source.package.base_price,
    max_pax: source.package.max_pax,
    status: "published",
    category: source.package.category,
    image_url: source.tour.featured_image_url,
    image_urls: source.tour.gallery_image_urls.slice(0, 6),
    highlights: source.package.highlights,
    options,
  };

  const { data: existingRows, error: existingErr } = await supabase
    .from("packages")
    .select("id")
    .eq("destination", source.tour.destination)
    .limit(1);
  if (existingErr) throw new Error(`Lookup package failed (${source.code}): ${existingErr.message}`);

  let packageId;
  if (existingRows && existingRows.length > 0) {
    const { data: updated, error: updateErr } = await supabase
      .from("packages")
      .update(packagePayload)
      .eq("id", existingRows[0].id)
      .select("id")
      .single();
    if (updateErr) throw new Error(`Update package failed (${source.code}): ${updateErr.message}`);
    packageId = updated.id;
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("packages")
      .insert(packagePayload)
      .select("id")
      .single();
    if (insertErr) throw new Error(`Insert package failed (${source.code}): ${insertErr.message}`);
    packageId = inserted.id;
  }

  await supabase.from("package_itinerary_items").delete().eq("package_id", packageId);
  const packageItineraryRows = source.itinerary.map((row, idx) => ({
    package_id: packageId,
    day_number: row.day_number,
    title: row.title,
    description: row.description,
    sort_order: idx,
  }));
  if (packageItineraryRows.length > 0) {
    const { error } = await supabase.from("package_itinerary_items").insert(packageItineraryRows);
    if (error) throw new Error(`Insert package itinerary failed (${source.code}): ${error.message}`);
  }

  const allRules = source.options.list
    .flatMap((option) => option.slotRules || [])
    .map((rule) => ({
      day: rule.day,
      time: /^\d{2}:\d{2}$/.test(rule.time) ? `${rule.time}:00` : rule.time,
      max_pax: Number(rule.max_pax || source.package.max_pax),
    }));

  const tripTemplates = buildTripTemplates(source.options.available_from, source.options.available_to, allRules).slice(0, 60);

  await supabase.from("trips").delete().eq("package_id", packageId);
  if (tripTemplates.length > 0) {
    const tripRows = tripTemplates.map((row) => ({
      package_id: packageId,
      date: row.date,
      time: row.time,
      status: "scheduled",
      max_participants: row.max_participants,
      guide_name: null,
    }));
    const { error } = await supabase.from("trips").insert(tripRows);
    if (error) throw new Error(`Insert trips failed (${source.code}): ${error.message}`);
  }

  return packageId;
}

async function verifyResult(expectedTours) {
  const { data: tours, error: tourErr } = await supabase
    .from("tours")
    .select("id, slug, status")
    .in("slug", expectedTours.map((x) => x.tour.slug));
  if (tourErr) throw new Error(`Verify tours failed: ${tourErr.message}`);

  const { data: packages, error: pkgErr } = await supabase
    .from("packages")
    .select("id, destination, status")
    .in("destination", expectedTours.map((x) => x.tour.destination));
  if (pkgErr) throw new Error(`Verify packages failed: ${pkgErr.message}`);

  return {
    tourCount: tours?.length || 0,
    packageCount: packages?.length || 0,
    tours: tours || [],
    packages: packages || [],
  };
}

async function main() {
  const dataset = buildTourDataset().filter((row) => row.code !== "koh-yao-hong");
  const cleanup = [
    {
      slug: "koh-yao-and-hong-islands-one-day-scenic-cruise",
      destination: "Koh Yao Noi, Thailand",
    },
  ];

  for (const row of cleanup) {
    await supabase.from("tours").delete().eq("slug", row.slug);
    await supabase.from("packages").delete().eq("destination", row.destination);
  }

  const categoryId = await ensureCategoryId();

  const resultRows = [];
  for (const source of dataset) {
    const tour = await upsertTourBase(categoryId, source);
    await replaceTourDetails(tour.id, source);
    await replaceSchedulesAndPricing(tour.id, source);
    const packageId = await upsertPackageAndTrips(source);
    resultRows.push({
      code: source.code,
      tour_id: tour.id,
      package_id: packageId,
      destination: source.tour.destination,
      slug: source.tour.slug,
    });
    console.log(`Seeded ${source.code} -> tour:${tour.id} package:${packageId}`);
  }

  const verify = await verifyResult(dataset);
  if (verify.tourCount !== dataset.length) {
    throw new Error(`Expected ${dataset.length} seeded tours by slug, found ${verify.tourCount}`);
  }

  console.log("\n=== DONE ===");
  console.log(JSON.stringify({
    seeded: resultRows.length,
    toursMatchedBySlug: verify.tourCount,
    packagesMatchedByDestination: verify.packageCount,
    rows: resultRows,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
