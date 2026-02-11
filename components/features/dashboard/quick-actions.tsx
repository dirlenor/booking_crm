import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, UserPlus } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button className="w-full justify-start" size="lg">
          <Plus className="mr-2 size-4" />
          Create New Booking
        </Button>
        <Button variant="outline" className="w-full justify-start" size="lg">
          <UserPlus className="mr-2 size-4" />
          Add Customer
        </Button>
        <Button variant="outline" className="w-full justify-start" size="lg">
          <Calendar className="mr-2 size-4" />
          Check Availability
        </Button>
      </CardContent>
    </Card>
  )
}
