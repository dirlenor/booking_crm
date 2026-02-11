"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingStepCustomer } from "./booking-step-customer";
import { BookingStepPackage } from "./booking-step-package";
import { BookingStepPassengers } from "./booking-step-passengers";
import { BookingStepSummary } from "./booking-step-summary";
import { BookingPassenger } from "@/lib/mock-data/bookings";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import type { Customer } from "@/lib/mock-data/customers";
import type { TourPackage } from "@/lib/mock-data/packages";
import { resolveOptionPricing, type PricingOptionLike } from "@/lib/pricing";

export function BookingCreateForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    customerId?: string;
    packageId?: string;
    tripDate?: string;
    tripId?: string;
    tripTime?: string;
    pax: number;
    passengers: BookingPassenger[];
  }>({
    pax: 2,
    passengers: []
  });

  useEffect(() => {
    const loadData = async () => {
      const [{ data: customerRows }, { data: packageRows }] = await Promise.all([
        supabase.from("customers").select("*").order("created_at", { ascending: false }),
        supabase.from("packages").select("*").eq("status", "published").order("created_at", { ascending: false }),
      ]);

      const mappedCustomers: Customer[] =
        customerRows?.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone ?? "-",
          totalBookings: 0,
          totalSpent: 0,
          lastBookingDate: "-",
          status: customer.status,
          tier: customer.tier,
          avatarInitials: customer.name
            .split(" ")
            .filter(Boolean)
            .map((part: string) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
        })) ?? [];

      const mappedPackages: TourPackage[] =
        packageRows?.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description ?? "",
          destination: pkg.destination ?? "",
          duration: pkg.duration ?? "",
          days: Number(String(pkg.duration ?? "").match(/(\d+)\s*Day/i)?.[1] ?? 0),
          nights: Number(String(pkg.duration ?? "").match(/(\d+)\s*Night/i)?.[1] ?? 0),
          price: Number(pkg.base_price ?? 0),
          maxPax: pkg.max_pax ?? 0,
          currentPax: 0,
          departureDate: new Date().toISOString().slice(0, 10),
          status: pkg.status,
          category: pkg.category,
          highlights: pkg.highlights ?? [],
          imageUrl: pkg.image_url ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
          options: Array.isArray(pkg.options) ? pkg.options : [],
        })) ?? [];

      setCustomers(mappedCustomers);
      setPackages(mappedPackages);
    };

    loadData();
  }, []);

  const updateData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.customerId || !formData.packageId || !formData.tripDate || !formData.tripId || !formData.tripTime) return;

    setSubmitting(true);
    setError(null);

    const selectedPackage = packages.find((pkg) => pkg.id === formData.packageId);
    const selectedOption = (selectedPackage?.options?.[0] ?? undefined) as PricingOptionLike | undefined;
    const pricing = resolveOptionPricing(selectedOption, formData.pax, Number(selectedPackage?.price ?? 0));
    const totalAmount = pricing.total;
    const bookingRef = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: bookingRow, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_ref: bookingRef,
        customer_id: formData.customerId,
        trip_id: formData.tripId,
        pax: formData.pax,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "unpaid",
      })
      .select("id")
      .single();

    if (bookingError || !bookingRow) {
      setError(bookingError?.message ?? "Failed to create booking");
      setSubmitting(false);
      return;
    }

    if (formData.passengers.length > 0) {
      const passengerRows = formData.passengers.map((passenger) => ({
        booking_id: bookingRow.id,
        name: passenger.name,
        type: passenger.type,
        age: passenger.age ?? null,
        passport_number: passenger.passportNumber ?? null,
        special_requests: passenger.specialRequests ?? null,
      }));

      const { error: passengerError } = await supabase
        .from("booking_passengers")
        .insert(passengerRows);

      if (passengerError) {
        setError(passengerError.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    router.push("/bookings");
    router.refresh();
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.customerId;
      case 2: return !!formData.packageId && !!formData.tripDate && !!formData.tripId && !!formData.tripTime && formData.pax > 0;
      case 3: return formData.passengers.length === formData.pax && formData.passengers.every(p => !!p.name);
      default: return true;
    }
  };

  const steps = [
    { number: 1, title: "Select Customer" },
    { number: 2, title: "Trip Details" },
    { number: 3, title: "Passengers" },
    { number: 4, title: "Review & Confirm" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      {/* Stepper */}
      <div className="flex items-center justify-between w-full px-4 md:px-20">
        {steps.map((s) => (
          <div key={s.number} className="flex flex-col items-center gap-2 relative z-10">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                step >= s.number 
                  ? "bg-primary text-primary-foreground shadow-lg scale-110" 
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {step > s.number ? <Check className="h-5 w-5" /> : s.number}
            </div>
            <span 
              className={`text-xs font-medium absolute -bottom-6 w-32 text-center transition-colors duration-300 ${
                step >= s.number ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
        
        {/* Progress Bar Background */}
        <div className="absolute left-0 w-full px-4 md:px-20 -z-0">
           <div className="h-0.5 w-full bg-muted relative">
              {/* Active Progress */}
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
           </div>
        </div>
      </div>

      <Card className="mt-8 border-none shadow-sm bg-background">
        <CardContent className="p-6 md:p-8">
          {step === 1 && (
              <BookingStepCustomer 
                customers={customers}
                selectedCustomerId={formData.customerId}
                onSelect={(id) => updateData({ customerId: id })}
              />
            )}

          {step === 2 && (
              <BookingStepPackage 
                packages={packages}
                data={{ 
                  packageId: formData.packageId, 
                  tripDate: formData.tripDate, 
                  tripId: formData.tripId,
                  tripTime: formData.tripTime,
                  pax: formData.pax 
                }}
                onSelect={(data) => updateData(data)}
              />
            )}

          {step === 3 && (
            <BookingStepPassengers 
              pax={formData.pax}
              data={formData.passengers}
              onUpdate={(passengers) => updateData({ passengers })}
            />
          )}

          {step === 4 && (
              <BookingStepSummary
                data={formData}
                customer={customers.find((c) => c.id === formData.customerId)}
                tourPackage={packages.find((p) => p.id === formData.packageId)}
              />
            )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-4">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={step === 1}
          className="w-32"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {step < 4 ? (
          <Button 
            onClick={nextStep} 
            disabled={!canProceed()}
            className="w-32"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            className="w-40 bg-green-600 hover:bg-green-700"
            disabled={submitting}
          >
            Confirm Booking
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {error && (
        <div className="text-center text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
