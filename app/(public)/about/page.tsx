import {
  Globe,
  Handshake,
  MapPin,
  Zap,
  Heart,
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
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
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
              <p className="mb-1 text-3xl font-bold text-primary">
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
              <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
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
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
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

    </div>
  );
}
