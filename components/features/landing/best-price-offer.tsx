import { CalendarDays, CreditCard, MapPinned, MousePointerClick } from "lucide-react";

export function BestPriceOffer() {
  const steps = [
    {
      id: "01",
      title: "Choose Your Trip",
      description: "Browse destinations and pick the package that matches your plan.",
      icon: MapPinned,
    },
    {
      id: "02",
      title: "Check Date & Time",
      description: "Select your travel date and preferred time slot.",
      icon: CalendarDays,
    },
    {
      id: "03",
      title: "Tap to Book",
      description: "Confirm details and continue your booking in one click.",
      icon: MousePointerClick,
    },
    {
      id: "04",
      title: "Make Payment",
      description: "Pay securely and get your booking confirmation instantly.",
      icon: CreditCard,
    },
  ];

  return (
    <section className="py-20 bg-gray-50" data-section="how_it_work_section">
      <div className="container mx-auto px-4">
        <span className="text-accent font-bold uppercase tracking-wide text-sm">How It Works</span>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-6">
          Book in 4 Easy Steps
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-3xl">
          Follow this simple flow to complete your booking journey from selection to payment.
        </p>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-section="how_it_work_steps">
          {steps.map((step) => (
            <li key={step.id} className="rounded-xl bg-white p-4 shadow-sm" data-section={`how_it_work_step_${step.id}`}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Step {step.id}</p>
                  <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{step.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
