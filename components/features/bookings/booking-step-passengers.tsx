import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingPassenger } from "@/lib/mock-data/bookings";
import { useState, useEffect } from "react";

interface BookingStepPassengersProps {
  pax: number;
  onUpdate: (passengers: BookingPassenger[]) => void;
  data: BookingPassenger[];
}

export function BookingStepPassengers({ pax, onUpdate, data }: BookingStepPassengersProps) {
  const [passengers, setPassengers] = useState<BookingPassenger[]>(
    Array.from({ length: pax }).map((_, i) => ({
      id: `temp-${i}`,
      name: data[i]?.name || '',
      type: data[i]?.type || 'Adult',
      age: data[i]?.age,
      passportNumber: data[i]?.passportNumber || ''
    }))
  );

  useEffect(() => {
    if (passengers.length !== pax) {
      setPassengers(prev => {
        const newPassengers = [...prev];
        if (pax > prev.length) {
          for (let i = prev.length; i < pax; i++) {
            newPassengers.push({
              id: `temp-${i}`,
              name: '',
              type: 'Adult',
            });
          }
        } else {
          newPassengers.splice(pax);
        }
        return newPassengers;
      });
    }
  }, [pax, passengers.length]);

  const updatePassenger = <K extends keyof BookingPassenger>(
    index: number,
    field: K,
    value: BookingPassenger[K]
  ) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
    onUpdate(newPassengers);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium">Passenger Details</h3>
        <p className="text-sm text-muted-foreground">Please enter details for all {pax} passengers.</p>
      </div>

      <div className="grid gap-4">
        {passengers.map((paxData, index) => (
          <Card key={index}>
            <CardHeader className="py-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Passenger {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2 lg:col-span-2">
                <label className="text-xs font-medium">Full Name</label>
                <Input 
                  placeholder="As shown in passport" 
                  value={paxData.name}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={paxData.type}
                  onChange={(e) => updatePassenger(index, 'type', e.target.value as BookingPassenger["type"])}
                >
                  <option value="Adult">Adult</option>
                  <option value="Child">Child (2-12)</option>
                  <option value="Infant">Infant (0-2)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">Age</label>
                <Input 
                  type="number" 
                  min={0}
                  max={120}
                  value={paxData.age ?? ''}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    updatePassenger(index, 'age', Number.isNaN(parsed) ? undefined : parsed);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2 lg:col-span-2">
                <label className="text-xs font-medium">Passport / ID Number</label>
                <Input 
                  placeholder="Optional" 
                  value={paxData.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                />
              </div>
              
               <div className="flex flex-col gap-2 lg:col-span-2">
                <label className="text-xs font-medium">Special Requests</label>
                <Input 
                  placeholder="Dietary, Wheelchair, etc." 
                  value={paxData.specialRequests}
                  onChange={(e) => updatePassenger(index, 'specialRequests', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
