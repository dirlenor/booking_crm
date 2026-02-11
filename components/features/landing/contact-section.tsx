import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section id="contact-us-section" className="py-16 bg-white border-t border-gray-100 scroll-mt-36">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-3xl p-8 md:p-12 overflow-hidden relative">
          {/* Background Patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Need help planning your trip?</h2>
              <p className="text-gray-200 text-lg mb-8">
                Our travel experts are available 24/7 to assist you with booking, itinerary planning, and any questions you may have.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-300">Call Us</span>
                    <span className="font-bold">+66 2 123 4567</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-300">Email Us</span>
                    <span className="font-bold">support@6catrip.com</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Agent" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/100?img=47" alt="Agent" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/100?img=12" alt="Agent" className="w-10 h-10 rounded-full border-2 border-white" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Online now</span>
              </div>
              
              <p className="text-gray-700 mb-6 text-sm">
                "Hi there! I'm Sarah. How can I help you plan your dream vacation today?"
              </p>
              
              <Button className="w-full bg-accent hover:bg-accent/90 text-white gap-2">
                <MessageCircle className="w-4 h-4" /> Chat with Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
