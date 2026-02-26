import Image from "next/image";
import step1Image from "@/image/step/step1.png";
import step2Image from "@/image/step/step2.png";
import step3Image from "@/image/step/step3.png";
import step4Image from "@/image/step/step4.png";

export function BestPriceOffer() {
  const steps = [
    {
      id: "01",
      title: "Choose Your Trip",
      description: "Browse destinations and pick the package that matches your plan.",
      image: step1Image,
    },
    {
      id: "02",
      title: "Check Date & Time",
      description: "Select your travel date and preferred time slot.",
      image: step2Image,
    },
    {
      id: "03",
      title: "Tap to Book",
      description: "Confirm details and continue your booking in one click.",
      image: step3Image,
    },
    {
      id: "04",
      title: "Make Payment",
      description: "Pay securely and get your booking confirmation instantly.",
      image: step4Image,
    },
  ];

  return (
    <section className="bg-gray-50 py-[60px]" data-section="how_it_work_section">
      <div className="container mx-auto px-4">
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-700">How It Works</span>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Book in 4 Easy Steps
        </h2>
        <p className="mt-2 mb-8 max-w-3xl text-slate-700">
          Follow this simple flow to complete your booking journey from selection to payment.
        </p>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-section="how_it_work_steps">
          {steps.map((step) => (
            <li key={step.id} className="rounded-xl bg-white p-4 shadow-sm" data-section={`how_it_work_step_${step.id}`}>
              <div className="overflow-hidden rounded-lg bg-slate-50 aspect-square">
                <Image
                  src={step.image}
                  alt={step.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Step {step.id}</p>
                <h3 className="mt-1 text-base font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
