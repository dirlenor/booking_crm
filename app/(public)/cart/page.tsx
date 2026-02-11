"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLocalCart, recalculateLocalCartItem, setLocalCart, type LocalCartItem } from "@/lib/cart/local-cart";
import { BookingProgress } from "@/components/features/booking-flow/booking-progress";

export default function CartPage() {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    setItems(getLocalCart());
  }, []);

  const updateItems = (next: LocalCartItem[]) => {
    setItems(next);
    setLocalCart(next);
  };

  const increasePax = (id: string) => {
    const next = items.map((item) => {
      if (item.id !== id) return item;
      return recalculateLocalCartItem(item, item.pax + 1);
    });
    updateItems(next);
  };

  const decreasePax = (id: string) => {
    const next = items.map((item) => {
      if (item.id !== id) return item;
      return recalculateLocalCartItem(item, item.pax - 1);
    });
    updateItems(next);
  };

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id));
  };

  const summary = useMemo(() => {
    const totalGuests = items.reduce((sum, item) => sum + item.pax, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return { totalGuests, subtotal, total: subtotal };
  }, [items]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <BookingProgress current="cart" />

      <div className="border-b bg-white/90 backdrop-blur">
        <div className="container mx-auto px-4 py-5">
          <Link href="/destinations" className="inline-flex items-center text-sm font-semibold text-primary hover:underline mb-2" data-section="cart_back_button">
            ← Back to Destinations
          </Link>
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Cart</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-500 mt-1">Review selected trips before checkout.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
              <p className="text-gray-500 max-w-md">Add a trip from destinations and it will appear here.</p>
              <Button asChild className="rounded-full px-6">
                <Link href="/destinations">Explore Destinations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
                      <img src={item.image} alt={item.title} className="w-full h-44 sm:h-full object-cover" />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.location}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Badge variant="outline" className="border-gray-200 text-gray-600">
                            {item.tripDate}{item.tripTime ? ` • ${item.tripTime}` : ""}
                          </Badge>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none">
                            Option: {item.optionName ?? "Standard"}
                          </Badge>
                          <Badge variant="outline" className="border-gray-200 text-gray-600">
                            Trip ID: {item.tripId}
                          </Badge>
                        </div>

                        <div className="mb-4 grid gap-1 text-xs text-gray-500" data-section={`cart_item_meta_${item.id.toLowerCase()}`}>
                          <p>Location: {item.location}</p>
                          <p>
                            Unit Price: THB {item.unitPrice.toLocaleString()} {item.isFlatRate ? "per package" : "per guest"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                            <button
                              className="w-8 h-8 rounded-md bg-white border border-gray-100 flex items-center justify-center text-gray-600"
                              onClick={() => decreasePax(item.id)}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="px-4 font-semibold text-gray-900">{item.pax}</div>
                            <button
                              className="w-8 h-8 rounded-md bg-white border border-gray-100 flex items-center justify-center text-gray-600"
                              onClick={() => increasePax(item.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              THB {item.unitPrice.toLocaleString()} {item.isFlatRate ? "/ package" : "/ guest"}
                            </p>
                            <p className="text-xl font-bold text-primary">THB {item.totalPrice.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-2xl border-gray-100 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trips</span>
                  <span className="font-medium text-gray-900">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium text-gray-900">{summary.totalGuests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">THB {summary.subtotal.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-primary text-xl">THB {summary.total.toLocaleString()}</span>
                </div>

                <Button asChild className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-white">
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                  <Link href="/destinations">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
