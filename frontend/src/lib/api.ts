import { supabase } from '@/lib/supabase';
import type {
  AccommodationRow,
  ActivityRow,
  Destination,
  FlightRow,
  Trip,
} from '@/lib/types';

export interface CreateTripInput {
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  destinations?: Destination[];
  budget_planned?: number | null;
  cover_image_url?: string | null;
}

export const fetchMyTrips = async (userId: string): Promise<Trip[]> => {
  const { data: owned, error: ownedError } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (ownedError) throw ownedError;

  const { data: participations, error: partError } = await supabase
    .from('trip_participants')
    .select('trip_id')
    .eq('user_id', userId);

  if (partError) throw partError;

  const participantTripIds = (participations ?? []).map((p) => p.trip_id).filter((id) => id);
  const ownedIds = (owned ?? []).map((t) => t.id);
  const missingIds = participantTripIds.filter((id) => !ownedIds.includes(id));

  let shared: Trip[] = [];
  if (missingIds.length > 0) {
    const { data, error: sharedError } = await supabase
      .from('trips')
      .select('*')
      .in('id', missingIds);

    if (sharedError) throw sharedError;
    shared = (data ?? []) as Trip[];
  }

  return [...(owned ?? []), ...shared] as Trip[];
};

export const createTrip = async (userId: string, input: CreateTripInput): Promise<Trip> => {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      owner_id: userId,
      name: input.name,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      destinations: input.destinations ?? [],
      budget_planned: input.budget_planned ?? null,
      cover_image_url: input.cover_image_url ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  // Owner is also recorded as a participant with role 'owner'.
  const { error: participantError } = await supabase.from('trip_participants').insert({
    trip_id: data.id,
    user_id: userId,
    role: 'owner',
    joined_at: new Date().toISOString(),
  });

  if (participantError) {
    // Rollback: rimuovi il viaggio appena creato per evitare righe orfane.
    await supabase.from('trips').delete().eq('id', data.id);
    throw participantError;
  }

  return data as Trip;
};

// ----------------------------------------------------------------------------
// Activities
// ----------------------------------------------------------------------------

export interface ActivityInput {
  name: string;
  description?: string | null;
  activity_date?: string | null;
  activity_time?: string | null;
  location_city?: string | null;
  location_address?: string | null;
  category?: string | null;
  status: 'planned' | 'booked' | 'completed';
  booking_ref?: string | null;
  notes?: string | null;
}

export const fetchActivities = async (tripId: string): Promise<ActivityRow[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('trip_id', tripId)
    .order('activity_date', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as ActivityRow[];
};

export const createActivity = async (
  tripId: string,
  userId: string,
  input: ActivityInput
): Promise<ActivityRow> => {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      trip_id: tripId,
      created_by_user_id: userId,
      name: input.name,
      description: input.description ?? null,
      activity_date: input.activity_date ?? null,
      activity_time: input.activity_time ?? null,
      location_city: input.location_city ?? null,
      location_address: input.location_address ?? null,
      category: input.category ?? null,
      status: input.status,
      booking_ref: input.booking_ref ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ActivityRow;
};

export const updateActivity = async (
  id: string,
  input: Partial<ActivityInput>
): Promise<ActivityRow> => {
  const { data, error } = await supabase
    .from('activities')
    .update({
      name: input.name,
      description: input.description ?? null,
      activity_date: input.activity_date ?? null,
      activity_time: input.activity_time ?? null,
      location_city: input.location_city ?? null,
      location_address: input.location_address ?? null,
      category: input.category ?? null,
      status: input.status,
      booking_ref: input.booking_ref ?? null,
      notes: input.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ActivityRow;
};

export const deleteActivity = async (id: string): Promise<void> => {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Accommodations
// ----------------------------------------------------------------------------

export interface AccommodationInput {
  name: string;
  type: 'hotel' | 'airbnb' | 'house' | 'apartment';
  address?: string | null;
  check_in_date?: string | null;
  check_in_time?: string | null;
  check_out_date?: string | null;
  check_out_time?: string | null;
  cost_total?: number | null;
  currency?: string | null;
  booking_ref?: string | null;
  contact_info?: string | null;
  notes?: string | null;
}

export const fetchAccommodations = async (tripId: string): Promise<AccommodationRow[]> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AccommodationRow[];
};

export const createAccommodation = async (
  tripId: string,
  input: AccommodationInput
): Promise<AccommodationRow> => {
  const { data, error } = await supabase
    .from('accommodations')
    .insert({
      trip_id: tripId,
      name: input.name,
      type: input.type,
      address: input.address ?? null,
      check_in_date: input.check_in_date ?? null,
      check_in_time: input.check_in_time ?? null,
      check_out_date: input.check_out_date ?? null,
      check_out_time: input.check_out_time ?? null,
      cost_total: input.cost_total ?? null,
      currency: input.currency ?? null,
      booking_ref: input.booking_ref ?? null,
      contact_info: input.contact_info ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as AccommodationRow;
};

export const updateAccommodation = async (
  id: string,
  input: Partial<AccommodationInput>
): Promise<AccommodationRow> => {
  const { data, error } = await supabase
    .from('accommodations')
    .update({
      name: input.name,
      type: input.type,
      address: input.address ?? null,
      check_in_date: input.check_in_date ?? null,
      check_in_time: input.check_in_time ?? null,
      check_out_date: input.check_out_date ?? null,
      check_out_time: input.check_out_time ?? null,
      cost_total: input.cost_total ?? null,
      currency: input.currency ?? null,
      booking_ref: input.booking_ref ?? null,
      contact_info: input.contact_info ?? null,
      notes: input.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AccommodationRow;
};

export const deleteAccommodation = async (id: string): Promise<void> => {
  const { error } = await supabase.from('accommodations').delete().eq('id', id);
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Flights
// ----------------------------------------------------------------------------

export interface FlightInput {
  departure_airport: string;
  arrival_airport: string;
  departure_datetime?: string | null;
  arrival_datetime?: string | null;
  airline?: string | null;
  flight_number?: string | null;
  booking_ref?: string | null;
  notes?: string | null;
}

export const fetchFlights = async (tripId: string): Promise<FlightRow[]> => {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('trip_id', tripId)
    .order('departure_datetime', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as FlightRow[];
};

export const createFlight = async (
  tripId: string,
  input: FlightInput
): Promise<FlightRow> => {
  const { data, error } = await supabase
    .from('flights')
    .insert({
      trip_id: tripId,
      departure_airport: input.departure_airport,
      arrival_airport: input.arrival_airport,
      departure_datetime: input.departure_datetime ?? null,
      arrival_datetime: input.arrival_datetime ?? null,
      airline: input.airline ?? null,
      flight_number: input.flight_number ?? null,
      booking_ref: input.booking_ref ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FlightRow;
};

export const updateFlight = async (
  id: string,
  input: Partial<FlightInput>
): Promise<FlightRow> => {
  const { data, error } = await supabase
    .from('flights')
    .update({
      departure_airport: input.departure_airport,
      arrival_airport: input.arrival_airport,
      departure_datetime: input.departure_datetime ?? null,
      arrival_datetime: input.arrival_datetime ?? null,
      airline: input.airline ?? null,
      flight_number: input.flight_number ?? null,
      booking_ref: input.booking_ref ?? null,
      notes: input.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as FlightRow;
};

export const deleteFlight = async (id: string): Promise<void> => {
  const { error } = await supabase.from('flights').delete().eq('id', id);
  if (error) throw error;
};