import {
  Globe,
  Handshake,
  MapPin,
  Zap,
  Heart,
  ArrowRight,
  Link2,
} from "lucide-react";

const stats = [
  { value: "120+", label: "Countries Covered" },
  { value: "5M+", label: "Happy Travelers" },
  { value: "15k+", label: "Local Partners" },
  { value: "4.9/5", label: "User Rating" },
];

const values = [
  {
    icon: Handshake,
    title: "Trust & Transparency",
    description:
      "Honest pricing and verified reviews are at our core. No hidden fees, ever.",
  },
  {
    icon: MapPin,
    title: "Local First",
    description:
      "We prioritize local operators and authentic experiences that support communities.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Using technology to make booking and exploring smoother than ever before.",
  },
  {
    icon: Heart,
    title: "Customer Obsession",
    description:
      "Our 24/7 support ensures you're never alone, no matter where you are.",
  },
];

const team = [
  {
    name: "Alex Chen",
    role: "Co-Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Sarah Williams",
    role: "Chief Technology Officer",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "David Miller",
    role: "Head of Global Operations",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Elena Rodriguez",
    role: "Chief Marketing Officer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&h=600&fit=crop",
];

export default function AboutPage() {
  return (
    <div className="-mt-20 md:-mt-32">
      {/* ── Hero Section ── */}
      <section className="relative flex h-[60vh] min-h-[500px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&h=900&fit=crop"
            alt="Aerial view of a tropical coastline"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-20 mx-auto max-w-4xl px-6 text-center">
          <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-md">
            Our Journey
          </span>
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Redefining the way you see the world.
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
            6CATRIP is on a mission to make world exploration accessible,
            seamless, and unforgettable for everyone.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="relative z-30 mx-auto -mt-12 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-black/5 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i > 0 ? "border-l border-gray-100" : ""}`}
            >
              <p className="mb-1 text-3xl font-black text-primary">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story Section ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="space-y-16">
          {/* Origin Story */}
          <div className="group flex flex-col items-center gap-12 md:flex-row">
            <div className="order-2 flex-1 space-y-6 md:order-1">
              <h2 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
                From a simple idea to a{" "}
                <span className="text-primary">global community</span>.
              </h2>
              <div className="h-1.5 w-20 rounded-full bg-primary" />
              <p className="text-lg italic leading-relaxed text-gray-600">
                &ldquo;It all started with a torn map and a missed train in
                Hanoi...&rdquo;
              </p>
              <p className="text-lg leading-relaxed text-gray-600">
                6CATRIP started in 2018 when our founders realized how difficult
                it was to find truly local, authentic experiences while traveling
                through Southeast Asia. What began as a curated list for friends
                blossomed into a platform that connects millions of travelers.
              </p>
            </div>
            <div className="order-1 w-full flex-none md:order-2 md:w-80">
              <div className="aspect-[4/5] rotate-2 overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 group-hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?w=500&h=625&fit=crop"
                  alt="Traveler exploring a local market"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-4 py-8 md:grid-cols-3">
            {galleryImages.map((src, i) => {
              const rotations = ["-rotate-3", "translate-y-8", "rotate-3"];
              return (
                <div
                  key={src}
                  className={`aspect-square overflow-hidden rounded-2xl shadow-lg transition-all hover:rotate-0 hover:translate-y-0 ${rotations[i]} ${i === 1 ? "hidden md:block" : ""}`}
                >
                  <img
                    src={src}
                    alt={`Travel gallery ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>

          {/* More Than Sightseeing */}
          <div className="group flex flex-col items-center gap-12 pt-8 md:flex-row">
            <div className="w-full flex-none md:w-64">
              <div className="-rotate-6 aspect-square overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 group-hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&h=500&fit=crop"
                  alt="Mountain landscape at sunrise"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-bold">
                More than just sightseeing
              </h3>
              <p className="text-lg leading-relaxed text-gray-600">
                We believe that travel is more than just checking items off a
                bucket list; it&apos;s about human connection, cultural
                understanding, and personal growth. Every destination tells a
                story, and every traveler becomes a part of it.
              </p>
              <p className="text-lg leading-relaxed text-gray-600">
                Our platform is designed to remove the friction from planning so
                you can focus on what matters: the journey itself. Whether
                it&apos;s a bustling market in Osaka or a quiet trail in the
                Andes, we&apos;re here to guide you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="bg-white py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black md:text-5xl">
              Values that drive us
            </h2>
            <p className="mx-auto max-w-2xl text-gray-500">
              The core principles that guide every decision we make and every
              experience we curate.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border border-transparent bg-gray-50 p-8 transition-all hover:border-primary/30"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{v.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="mb-4 text-3xl font-black md:text-5xl">
              Meet the explorers
            </h2>
            <p className="text-gray-500">
              The passionate team of travel enthusiasts and tech pioneers behind
              6CATRIP.
            </p>
          </div>
          <button
            type="button"
            className="group flex items-center gap-2 font-bold text-primary"
          >
            See all careers
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="space-y-4">
              <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                />
                <div className="absolute bottom-4 right-4 flex translate-y-12 gap-2 transition-transform duration-300 group-hover:translate-y-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                    <Link2 className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold">{member.name}</h4>
                <p className="text-sm font-semibold text-primary">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10 bg-primary/90 mix-blend-multiply" />
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop"
              alt="Road trip scenery"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative z-20 px-8 py-20 text-center text-white md:px-16">
            <h2 className="mb-6 text-4xl font-black md:text-5xl">
              Your next adventure starts here
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-white/90">
              Join millions of travelers who trust 6CATRIP to discover the
              extraordinary. Where will you go next?
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-primary transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                Explore Destinations
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/30 bg-primary/20 px-8 py-4 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Download the App
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
