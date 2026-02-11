"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DestinationDetail } from "@/lib/mock-data/destination-detail";

interface ReviewsSectionProps {
  reviews: DestinationDetail['reviews'];
  rating: number;
  count: number;
}

export function ReviewsSection({ reviews, rating, count }: ReviewsSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "fill-current" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="font-bold text-primary">{rating}</span>
            <span className="text-gray-400 text-sm">({count} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-accent/10 text-accent font-bold">
                    {review.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-primary text-sm">{review.author}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                ))}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              "{review.content}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
