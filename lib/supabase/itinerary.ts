import { supabase } from './client';
import type {
  TourItineraryRow,
  TourItineraryInsert,
  TourItineraryUpdate,
  ServiceResponse,
} from '@/types/database';

export async function getItineraryByTour(
  tourId: string
): Promise<ServiceResponse<TourItineraryRow[]>> {
  const { data, error } = await supabase
    .from('tour_itinerary')
    .select('*')
    .eq('tour_id', tourId)
    .order('day_number', { ascending: true });

  return {
    data: (data as TourItineraryRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function getItineraryDay(
  tourId: string,
  dayNumber: number
): Promise<ServiceResponse<TourItineraryRow>> {
  const { data, error } = await supabase
    .from('tour_itinerary')
    .select('*')
    .eq('tour_id', tourId)
    .eq('day_number', dayNumber)
    .maybeSingle();

  return {
    data: data as TourItineraryRow | null,
    error: error?.message ?? null,
  };
}

export async function createItineraryDay(
  input: TourItineraryInsert
): Promise<ServiceResponse<TourItineraryRow>> {
  const { data, error } = await supabase
    .from('tour_itinerary')
    .insert(input)
    .select()
    .single();

  return {
    data: data as TourItineraryRow | null,
    error: error?.message ?? null,
  };
}

export async function createItineraryBulk(
  inputs: TourItineraryInsert[]
): Promise<ServiceResponse<TourItineraryRow[]>> {
  const { data, error } = await supabase
    .from('tour_itinerary')
    .insert(inputs)
    .select();

  return {
    data: (data as TourItineraryRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function updateItineraryDay(
  id: string,
  input: TourItineraryUpdate
): Promise<ServiceResponse<TourItineraryRow>> {
  const { data, error } = await supabase
    .from('tour_itinerary')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TourItineraryRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteItineraryDay(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('tour_itinerary')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function deleteItineraryByTour(
  tourId: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('tour_itinerary')
    .delete()
    .eq('tour_id', tourId);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export function generateDefaultItinerary(
  tourId: string,
  durationDays: number
): TourItineraryInsert[] {
  return Array.from({ length: durationDays }, (_, i) => ({
    tour_id: tourId,
    day_number: i + 1,
    title: `Day ${i + 1}`,
    description: '',
    activities: [],
    meals: [],
    sort_order: i,
    accommodation_name: null,
    accommodation_description: null,
  }));
}
