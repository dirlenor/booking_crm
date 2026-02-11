"use client";

import { Check, X } from "lucide-react";

interface InclusionsListProps {
  inclusions: string[];
  exclusions: string[];
}

export function InclusionsList({ inclusions, exclusions }: InclusionsListProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Included */}
      <div className="bg-green-50/50 rounded-2xl p-6 md:p-8 border border-green-100">
        <h3 className="text-lg font-bold text-green-800 mb-6 flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          What's Included
        </h3>
        <ul className="space-y-4">
          {inclusions.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Excluded */}
      <div className="bg-red-50/50 rounded-2xl p-6 md:p-8 border border-red-100">
        <h3 className="text-lg font-bold text-red-800 mb-6 flex items-center">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <X className="w-5 h-5 text-red-600" />
          </div>
          Not Included
        </h3>
        <ul className="space-y-4">
          {exclusions.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
