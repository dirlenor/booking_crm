"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <section className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Support Center
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              Get in Touch with Our Experts
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-500">
              Have a question or need assistance with your booking? Our travel
              experts are ready to assist you 24/7. We&apos;re here to help make
              your journey effortless.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Call Us</h3>
                  <p className="text-sm text-gray-500">+66 2 000 6000</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Us</h3>
                  <p className="text-sm text-gray-500">support@6catrip.com</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4 rounded-xl bg-[#23160f] p-6 text-white">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-grow">
                <p className="text-sm font-medium text-white/70">
                  Need a quick answer?
                </p>
                <p className="font-bold">
                  Check our Frequently Asked Questions
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#23160f] transition-colors hover:bg-primary hover:text-white"
              >
                View FAQ
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-primary/5">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Send us a Message
            </h2>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Subject
                </label>
                <select className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Booking Inquiry</option>
                  <option>Refund Request</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Send Message
              </button>

              {submitted && (
                <p className="text-sm font-medium text-primary">
                  Thanks! We received your message and will get back to you
                  shortly.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Find Our Office
            </h2>
            <p className="mt-2 text-gray-500">
              Visit our headquarters in the heart of Bangkok
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-xl border border-gray-200 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Main Office
                </h3>
                <p className="mt-2 leading-relaxed text-gray-500">
                  123 Travel Street, Suite 500
                  <br />
                  Bangkok, Thailand 10110
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Working Hours
                </h3>
                <p className="mt-2 text-gray-500">
                  Mon - Fri: 9:00 AM - 6:00 PM
                </p>
                <p className="text-gray-500">
                  Sat - Sun: 10:00 AM - 4:00 PM
                </p>
              </div>
            </div>

            <div className="group relative h-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 lg:col-span-2">
              <iframe
                title="6CATRIP Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5747!2d100.5018!3d13.7563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ1JzIyLjciTiAxMDDCsDMwJzA2LjUiRQ!5e0!3m2!1sen!2sth!4v1700000000000"
                className="h-full w-full border-0 grayscale transition-all duration-700 group-hover:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-0 bg-primary/5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
