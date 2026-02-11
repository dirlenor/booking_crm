"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ColorCardProps = {
  name: string;
  variable: string;
  className?: string;
  hex: string;
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Design System Showcase
          </h1>
          <p className="text-xl text-muted-foreground">
            A preview of the 6CAT Booking CRM design tokens and base components.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Colors
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <ColorCard
              name="Primary"
              variable="--primary"
              className="bg-primary text-primary-foreground"
              hex="#FF4B13"
            />
            <ColorCard
              name="Accent"
              variable="--accent"
              className="bg-accent text-accent-foreground"
              hex="#f97316"
            />
            <ColorCard
              name="Secondary"
              variable="--secondary"
              className="bg-secondary text-secondary-foreground"
              hex="#e2e8f0"
            />
            <ColorCard
              name="Destructive"
              variable="--destructive"
              className="bg-destructive text-destructive-foreground"
              hex="#ef4444"
            />
            <ColorCard
              name="Muted"
              variable="--muted"
              className="bg-muted text-muted-foreground"
              hex="#f3f4f6"
            />
            <ColorCard
              name="Card"
              variable="--card"
              className="border bg-card text-card-foreground"
              hex="#ffffff"
            />
            <ColorCard
              name="Background"
              variable="--background"
              className="border bg-background text-foreground"
              hex="#f3f4f6"
            />
            <ColorCard
              name="Border"
              variable="--border"
              className="bg-border text-foreground"
              hex="#e2e8f0"
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Typography
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">
                Inter (Headings & UI)
              </h3>
              <div className="space-y-2">
                <p className="text-4xl font-bold">Heading 1</p>
                <p className="text-3xl font-semibold">Heading 2</p>
                <p className="text-2xl font-medium">Heading 3</p>
                <p className="text-base">
                  Body text using Inter. Clean, legible, and perfect for UI.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">
                Prompt (Thai Support)
              </h3>
              <div className="space-y-2">
                <p className="text-4xl font-bold">Prompt Heading 1</p>
                <p className="text-3xl font-semibold">Prompt Heading 2</p>
                <p className="text-2xl font-medium">Prompt Heading 3</p>
                <p className="text-base">
                  Prompt provides strong Thai support while staying clean and
                  modern in Latin contexts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg">Large Button</Button>
            <Button>Default Button</Button>
            <Button size="sm">Small Button</Button>
            <Button size="icon" aria-label="Icon">
              <span className="size-4">★</span>
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Badges
          </h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Cards & Inputs
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access the CRM.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" placeholder="hello@6cat.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input id="password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost">Forgot Password?</Button>
                <Button>Sign In</Button>
              </CardFooter>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-white">Premium Card</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Highlights and special actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This card uses the primary color as background, perfect for
                  highlighting key information or calls to action.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Data Table
          </h2>
          <Card>
            <Table>
              <TableCaption>Recent bookings.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Paid</Badge>
                  </TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV002</TableCell>
                  <TableCell>
                    <Badge variant="outline">Pending</Badge>
                  </TableCell>
                  <TableCell>PayPal</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV003</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Unpaid</Badge>
                  </TableCell>
                  <TableCell>Bank Transfer</TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
            Interactive
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog Example</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  );
}

function ColorCard({ name, variable, className, hex }: ColorCardProps) {
  return (
    <div className="space-y-2">
      <div
        className={`flex h-24 w-full items-end rounded-lg p-2 shadow-sm ${className}`}
      >
        <span className="text-xs font-mono opacity-80">{variable}</span>
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs font-mono text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}
