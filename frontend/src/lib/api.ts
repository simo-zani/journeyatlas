import { supabase } from '@/lib/supabase';
import type {
  AccommodationRow,
  ActivityRow,
  ChecklistCategoryRow,
  ChecklistItemRow,
  Destination,
  IncomingFriendRequest,
  PendingInvite,
  ProfileRow,
  ProfileSearchResult,
  Role,
  TransportRow,
  TransportType,
  TravelerProfile,
  TravelerSearchResult,
  PublicTripRow,
  Trip,
  TripParticipantDetail,
  TripParticipantRow,
} from '@/lib/types';

export const fetchProfile = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateProfile = async (
  userId: string,
  input: { avatar_url?: string | null; username?: string }
): Promise<ProfileRow> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export interface CreateTripInput {
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  destinations?: Destination[];
  budget_planned?: number | null;
  cover_image_url?: string | null;
  cover_position_y?: number;
  is_public?: boolean;
}

/** True if the username is already taken (case-insensitive), checked via
 * an RPC so the signup form never needs direct read access to `profiles`. */
export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('username_exists', { check_username: username });
  if (error) throw error;
  return !data;
};

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
    .eq('user_id', userId)
    .eq('status', 'accepted');

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

export const updateTrip = async (id: string, input: Partial<CreateTripInput>): Promise<Trip> => {
  const patch: Partial<CreateTripInput> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.start_date !== undefined) patch.start_date = input.start_date;
  if (input.end_date !== undefined) patch.end_date = input.end_date;
  if (input.destinations !== undefined) patch.destinations = input.destinations;
  if (input.budget_planned !== undefined) patch.budget_planned = input.budget_planned;
  if (input.cover_image_url !== undefined) patch.cover_image_url = input.cover_image_url;
  if (input.cover_position_y !== undefined) patch.cover_position_y = input.cover_position_y;
  if (input.is_public !== undefined) patch.is_public = input.is_public;

  const { data, error } = await supabase
    .from('trips')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Trip;
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
      is_public: input.is_public ?? false,
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
// Transports
// ----------------------------------------------------------------------------

export interface TransportInput {
  transport_type: TransportType;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime?: string | null;
  arrival_datetime?: string | null;
  airline?: string | null;
  flight_number?: string | null;
  booking_ref?: string | null;
  notes?: string | null;
}

export const fetchTransports = async (tripId: string): Promise<TransportRow[]> => {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('trip_id', tripId)
    .order('departure_datetime', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as TransportRow[];
};

export const createTransport = async (
  tripId: string,
  input: TransportInput
): Promise<TransportRow> => {
  const { data, error } = await supabase
    .from('flights')
    .insert({
      trip_id: tripId,
      transport_type: input.transport_type,
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
  return data as TransportRow;
};

export const updateTransport = async (
  id: string,
  input: Partial<TransportInput>
): Promise<TransportRow> => {
  const { data, error } = await supabase
    .from('flights')
    .update({
      transport_type: input.transport_type,
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
  return data as TransportRow;
};

export const deleteTransport = async (id: string): Promise<void> => {
  const { error } = await supabase.from('flights').delete().eq('id', id);
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Checklist items
// ----------------------------------------------------------------------------

export interface ChecklistItemInput {
  name: string;
  category?: string | null;
  quantity?: number;
  notes?: string | null;
}

export const CHECKLIST_CATEGORIES = [
  'documenti',
  'abbigliamento',
  'toilette',
  'elettronica',
  'salute',
  'altro',
] as const;

export const fetchChecklistItems = async (tripId: string): Promise<ChecklistItemRow[]> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('category', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChecklistItemRow[];
};

export const createChecklistItem = async (
  tripId: string,
  userId: string,
  input: ChecklistItemInput
): Promise<ChecklistItemRow> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert({
      trip_id: tripId,
      created_by_user_id: userId,
      name: input.name,
      category: input.category ?? null,
      quantity: input.quantity ?? 1,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistItemRow;
};

export const updateChecklistItem = async (
  id: string,
  input: Partial<ChecklistItemInput>
): Promise<ChecklistItemRow> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .update({
      name: input.name,
      category: input.category ?? null,
      quantity: input.quantity ?? 1,
      notes: input.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistItemRow;
};

export const toggleChecklistItem = async (
  item: ChecklistItemRow,
  userId: string
): Promise<ChecklistItemRow> => {
  const now = new Date().toISOString();
  const becomingPacked = !item.packed;
  const { data, error } = await supabase
    .from('checklist_items')
    .update({
      packed: becomingPacked,
      packed_by_user_id: becomingPacked ? userId : null,
      packed_at: becomingPacked ? now : null,
    })
    .eq('id', item.id)
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistItemRow;
};

export const deleteChecklistItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('checklist_items').delete().eq('id', id);
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Checklist categories (custom, with icon)
// ----------------------------------------------------------------------------

export const fetchChecklistCategories = async (tripId: string): Promise<ChecklistCategoryRow[]> => {
  const { data, error } = await supabase
    .from('checklist_categories')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChecklistCategoryRow[];
};

export const createChecklistCategory = async (
  tripId: string,
  name: string,
  icon: string
): Promise<ChecklistCategoryRow> => {
  const { data, error } = await supabase
    .from('checklist_categories')
    .insert({ trip_id: tripId, name, icon })
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistCategoryRow;
};

// ----------------------------------------------------------------------------
// Condivisione viaggio: inviti e partecipanti
// ----------------------------------------------------------------------------

/** Cerca utenti per username (prefix match) da invitare a un viaggio —
 * esclude se stessi e chi è già coinvolto (in qualsiasi stato). */
export const searchUsersForInvite = async (
  query: string,
  tripId: string
): Promise<ProfileSearchResult[]> => {
  if (!query.trim()) return [];
  const { data, error } = await supabase.rpc('search_profiles_by_username', {
    search_query: query.trim(),
    for_trip_id: tripId,
  });
  if (error) throw error;
  return data ?? [];
};

/** Crea un invito "pending" — protetto dalla policy che permette insert
 * su trip_participants solo al proprietario del viaggio. */
export const inviteParticipant = async (
  tripId: string,
  userId: string,
  role: 'editor' | 'viewer',
  invitedBy: string
): Promise<TripParticipantRow> => {
  const { data, error } = await supabase
    .from('trip_participants')
    .insert({ trip_id: tripId, user_id: userId, role, status: 'pending', invited_by: invitedBy })
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const fetchPendingInvitesForMe = async (): Promise<PendingInvite[]> => {
  const { data, error } = await supabase.rpc('fetch_pending_invites');
  if (error) throw error;
  return data ?? [];
};

/** L'invitato accetta/rifiuta il proprio invito, tramite RPC dedicata
 * (un self-update via RLS gli avrebbe permesso di alterare anche il ruolo). */
export const respondToInvite = async (participantId: string, accept: boolean): Promise<void> => {
  const { error } = await supabase.rpc('respond_to_invite', { participant_id: participantId, accept });
  if (error) throw error;
};

/** Partecipanti di un viaggio con i dati profilo essenziali, via RPC
 * (profiles non consente SELECT su righe altrui — vedi migration 0011). */
export const fetchTripParticipants = async (tripId: string): Promise<TripParticipantDetail[]> => {
  const { data, error } = await supabase.rpc('fetch_trip_participants', { for_trip_id: tripId });
  if (error) throw error;
  return data ?? [];
};

export const updateParticipantRole = async (participantId: string, role: Role): Promise<void> => {
  const { error } = await supabase.from('trip_participants').update({ role }).eq('id', participantId);
  if (error) throw error;
};

export const removeParticipant = async (participantId: string): Promise<void> => {
  const { error } = await supabase.from('trip_participants').delete().eq('id', participantId);
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Viaggiatori & Amici
// ----------------------------------------------------------------------------

/** Cerca viaggiatori per username (prefix match) con lo stato dell'amicizia
 * rispetto all'utente corrente. */
export const searchTravelers = async (query: string): Promise<TravelerSearchResult[]> => {
  if (!query.trim()) return [];
  const { data, error } = await supabase.rpc('search_travelers', {
    search_query: query.trim(),
  });
  if (error) throw error;
  return data ?? [];
};

/** Profilo pubblico di un viaggiatore: dati base + statistiche paesi/continenti
 * visitati (pubbliche per tutti) + stato amicizia. */
export const fetchTravelerProfile = async (targetUserId: string): Promise<TravelerProfile | null> => {
  const { data, error } = await supabase.rpc('get_traveler_profile', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
  return data?.[0] ?? null;
};

/** Viaggi pubblici di un utente (is_public = true). */
export const fetchPublicTripsForUser = async (
  targetUserId: string
): Promise<PublicTripRow[]> => {
  const { data, error } = await supabase.rpc('get_public_trips_for_user', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
  return data ?? [];
};

/** Viaggiatori popolari (mostrati di default nella pagina Viaggiatori). */
export const fetchPopularTravelers = async (): Promise<TravelerSearchResult[]> => {
  const { data, error } = await supabase.rpc('get_popular_travelers', {});
  if (error) throw error;
  return data ?? [];
};

/** Registra una visita al profilo di un viaggiatore (+1, rate-limited). */
export const recordProfileView = async (targetUserId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('record_profile_view', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
  return data ?? false;
};

/** Elenco amici (amicizie accettate) dell'utente corrente. */
export const fetchFriends = async (): Promise<TravelerSearchResult[]> => {
  const { data, error } = await supabase.rpc('get_friends', {});
  if (error) throw error;
  return data ?? [];
};

/** Richieste di amicizia ricevute (pending). */
export const fetchIncomingFriendRequests = async (): Promise<IncomingFriendRequest[]> => {
  const { data, error } = await supabase.rpc('get_incoming_friend_requests', {});
  if (error) throw error;
  return data ?? [];
};

/** Conteggio richieste ricevute (badge in sidebar). */
export const countIncomingFriendRequests = async (): Promise<number> => {
  const { data, error } = await supabase.rpc('count_incoming_friend_requests', {});
  if (error) throw error;
  return (data ?? 0) as number;
};

/** Invia una richiesta di amicizia (riattiva una eventuale coppia 'declined'). */
export const sendFriendRequest = async (addresseeId: string): Promise<string> => {
  const { data, error } = await supabase.rpc('send_friend_request', {
    addressee_id: addresseeId,
  });
  if (error) throw error;
  return data ?? '';
};

/** Accetta/rifiuta una richiesta di amicizia ricevuta. */
export const respondToFriendRequest = async (
  friendshipId: string,
  accept: boolean
): Promise<void> => {
  const { error } = await supabase.rpc('respond_to_friend_request', {
    friendship_id: friendshipId,
    accept,
  });
  if (error) throw error;
};

/** Rende un viaggio pubblico/privato (solo owner). */
export const setTripPublic = async (tripId: string, isPublic: boolean): Promise<void> => {
  const { error } = await supabase.rpc('set_trip_public', {
    trip_id: tripId,
    is_public: isPublic,
  });
  if (error) throw error;
};