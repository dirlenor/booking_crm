type BookingFlowStep = "cart" | "checkout" | "payment" | "thank_you";

const steps: Array<{ key: BookingFlowStep; label: string }> = [
  { key: "cart", label: "Cart" },
  { key: "checkout", label: "Checkout" },
  { key: "payment", label: "Payment" },
  { key: "thank_you", label: "Thank You" },
];

export function BookingProgress({ current }: { current: BookingFlowStep }) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === current)
  );
  const remaining = Math.max(0, steps.length - currentIndex - 1);
  const percent = (currentIndex / (steps.length - 1)) * 100;

  return (
    <section className="container mx-auto px-4 pt-8" data-section="booking_progress">
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm" data-section="booking_progress_card">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-gray-500" data-section="booking_progress_meta">
          <span>
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span>{remaining} step(s) remaining</span>
        </div>

        <div className="h-2 rounded-full bg-[#ffe8db]" data-section="booking_progress_track">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percent}%` }}
            data-section="booking_progress_fill"
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 text-xs" data-section="booking_progress_steps">
          {steps.map((step, index) => {
            const isActive = step.key === current;
            const isDone = index <= currentIndex;

            return (
              <div key={step.key} className="flex items-center gap-2" data-section={`booking_progress_step_${step.key}`}>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isDone ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </span>
                <span className={isActive ? "font-bold text-primary" : "font-medium text-gray-600"}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
