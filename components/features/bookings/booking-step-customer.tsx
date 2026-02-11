import { Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/mock-data/customers";

interface BookingStepCustomerProps {
  onSelect: (customerId: string) => void;
  selectedCustomerId?: string;
  customers: Customer[];
}

export function BookingStepCustomer({ onSelect, selectedCustomerId, customers }: BookingStepCustomerProps) {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email, or phone..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {filteredCustomers.map((customer) => {
          const isSelected = selectedCustomerId === customer.id;
          return (
            <Card 
              key={customer.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 relative p-4 flex items-start gap-4",
                isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border"
              )}
              onClick={() => onSelect(customer.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
              
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {customer.avatarInitials}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate pr-6">{customer.name}</span>
                <span className="text-sm text-muted-foreground truncate">{customer.email}</span>
                <span className="text-sm text-muted-foreground">{customer.phone}</span>
                <div className="mt-2 flex items-center gap-2">
                   <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                     {customer.tier}
                   </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {filteredCustomers.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No customers found matching "{search}"
        </div>
      )}
    </div>
  );
}
