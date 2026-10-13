import i18n from '@/i18n/config';
import { supabase } from '@/lib/supabase';
import type {
  AtlasMarkRow,
  AccommodationRow,
  ActivityCategoryRow,
  ActivityRow,
  ChecklistCategoryRow,
  ChecklistItemRow,
  Coordinates,
  Destination,
  Stopover,
  ExpenseCategoryRow,
  ExpenseKind,
  ExpenseSplitMode,
  ExpenseWithSplits,
  IncomingFriendRequest,
  PendingInvite,
  ProfileRow,
  Role,
  TransportRow,
  TransportType,
  TravelerProfile,
  TravelerSearchResult,
  PublicTripRow,
  Trip,
  TripParticipantDetail,
  InviteCompanion,
  TripParticipantRow,
  TripNotification,
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
  input: {
    avatar_url?: string | null;
    username?: string;
    /** null = azzera il campo, come per gli altri optional. */
    home_city?: string | null;
    home_city_coords?: Coordinates | null;
    /** Codice ISO alpha-2; null = nessuna nazionalità. */
    nationality?: string | null;
  }
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
  is_memory?: boolean;
  date_precision?: 'day' | 'month';
  stopovers?: Stopover[];
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
  if (input.is_memory !== undefined) patch.is_memory = input.is_memory;
  if (input.date_precision !== undefined) patch.date_precision = input.date_precision;
  if (input.stopovers !== undefined) patch.stopovers = input.stopovers;

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
      is_memory: input.is_memory ?? false,
      date_precision: input.date_precision ?? 'day',
      stopovers: input.stopovers ?? [],
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

/** Path di un oggetto di un bucket pubblico a partire dal suo URL pubblico (null se è altrove, es. Unsplash). */
const storagePathFromPublicUrl = (url: string | null, bucket: string): string | null => {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
};

/** Elimina definitivamente un viaggio (solo il proprietario).
 * Prima rimuove, per quanto possibile, i file su storage (copertina e foto
 * degli alloggi: le policy permettono di cancellare solo i propri, gli altri
 * restano orfani ma non visibili da nessuna parte), poi l'RPC delete_trip
 * avvisa i partecipanti e cancella il viaggio con tutto ciò che vi è legato. */
export const deleteTrip = async (trip: Pick<Trip, 'id' | 'cover_image_url'>): Promise<void> => {
  try {
    const { data: photos } = await supabase.from('accommodations').select('photo_path').eq('trip_id', trip.id);
    const photoPaths = (photos ?? []).map((p) => p.photo_path).filter((p): p is string => !!p);
    if (photoPaths.length > 0) await supabase.storage.from('accommodation-photos').remove(photoPaths);
    const coverPath = storagePathFromPublicUrl(trip.cover_image_url, 'trip-covers');
    if (coverPath) await supabase.storage.from('trip-covers').remove([coverPath]);
  } catch {
    // la pulizia dei file non deve impedire l'eliminazione del viaggio
  }
  const { error } = await supabase.rpc('delete_trip', { p_trip_id: trip.id });
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Activities
// ----------------------------------------------------------------------------

// Shared between ActivitySection (form/filters) and CalendarSection (category
// color assignment) — both must build the same stably-sorted category list,
// predefined ones included, or the same category would get a different color
// in each view.
export const ACTIVITY_CATEGORIES = ['attrazione', 'ristorante', 'transport', 'evento', 'altro'] as const;

export interface ActivityInput {
  name: string;
  description?: string | null;
  activity_date?: string | null;
  activity_time?: string | null;
  all_day?: boolean;
  end_date?: string | null;
  end_time?: string | null;
  location_city?: string | null;
  location_address?: string | null;
  category?: string | null;
  icon?: string | null;
  status: 'planned' | 'booked' | 'completed';
  booking_ref?: string | null;
  booking_operator?: string | null;
  booking_operator_logo?: string | null;
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
      all_day: input.all_day ?? false,
      end_date: input.end_date ?? null,
      end_time: input.end_time ?? null,
      location_city: input.location_city ?? null,
      location_address: input.location_address ?? null,
      category: input.category ?? null,
      icon: input.icon ?? null,
      status: input.status,
      booking_ref: input.booking_ref ?? null,
      booking_operator: input.booking_operator ?? null,
      booking_operator_logo: input.booking_operator_logo ?? null,
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
  // Genuinely partial: only fields present in `input` are written. The
  // previous version always wrote every column via `?? null`, so a caller
  // passing e.g. just `{ status: 'completed' }` silently wiped out the
  // activity's name/date/category/etc — every field it omitted was
  // `undefined`, and `undefined ?? null` is `null`.
  const patch: Partial<ActivityRow> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.activity_date !== undefined) patch.activity_date = input.activity_date;
  if (input.activity_time !== undefined) patch.activity_time = input.activity_time;
  if (input.all_day !== undefined) patch.all_day = input.all_day;
  if (input.end_date !== undefined) patch.end_date = input.end_date;
  if (input.end_time !== undefined) patch.end_time = input.end_time;
  if (input.location_city !== undefined) patch.location_city = input.location_city;
  if (input.location_address !== undefined) patch.location_address = input.location_address;
  if (input.category !== undefined) patch.category = input.category;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.status !== undefined) patch.status = input.status;
  if (input.booking_ref !== undefined) patch.booking_ref = input.booking_ref;
  if (input.booking_operator !== undefined) patch.booking_operator = input.booking_operator;
  if (input.booking_operator_logo !== undefined) patch.booking_operator_logo = input.booking_operator_logo;
  if (input.notes !== undefined) patch.notes = input.notes;

  const { data, error } = await supabase.from('activities').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as ActivityRow;
};

export const deleteActivity = async (id: string): Promise<void> => {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Activity categories (custom, senza icona: l'icona è sulla singola attività)
// ----------------------------------------------------------------------------

export const fetchActivityCategories = async (tripId: string): Promise<ActivityCategoryRow[]> => {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ActivityCategoryRow[];
};

export const createActivityCategory = async (
  tripId: string,
  name: string
): Promise<ActivityCategoryRow> => {
  const { data, error } = await supabase
    .from('activity_categories')
    .insert({ trip_id: tripId, name })
    .select()
    .single();
  if (error) throw error;
  return data as ActivityCategoryRow;
};

// ----------------------------------------------------------------------------
// Accommodations
// ----------------------------------------------------------------------------

export interface AccommodationInput {
  name: string;
  type: 'hotel' | 'apartment';
  /** Stelle dell'hotel, 1-5. null quando non valutata. */
  stars?: number | null;
  /** Camere prenotate, solo per gli hotel. null quando non specificato. */
  rooms_count?: number | null;
  /** Bagni, solo per gli appartamenti. */
  bathrooms_count?: number | null;
  address?: string | null;
  city?: string | null;
  coordinates?: Coordinates | null;
  check_in_date?: string | null;
  check_in_time?: string | null;
  check_out_date?: string | null;
  check_out_time?: string | null;
  cost_total?: number | null;
  currency?: string | null;
  booking_ref?: string | null;
  booking_url?: string | null;
  booking_platform?: string | null;
  booking_platform_logo?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  amenities?: string[];
  photo_url?: string | null;
  photo_path?: string | null;
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

/**
 * Normalizza tutti i campi di una scrittura "completa" (create).
 * Le chiavi assenti diventano esplicitamente null/[] così il DB non eredita
 * valori dalla creazione.
 */
const accFields = (input: Partial<AccommodationInput>) => ({
  name: input.name,
  type: input.type,
  stars: input.stars ?? null,
  rooms_count: input.rooms_count ?? null,
  bathrooms_count: input.bathrooms_count ?? null,
  address: input.address ?? null,
  city: input.city ?? null,
  coordinates: input.coordinates ?? null,
  check_in_date: input.check_in_date ?? null,
  check_in_time: input.check_in_time ?? null,
  check_out_date: input.check_out_date ?? null,
  check_out_time: input.check_out_time ?? null,
  cost_total: input.cost_total ?? null,
  currency: input.currency ?? null,
  booking_ref: input.booking_ref ?? null,
  booking_url: input.booking_url ?? null,
  booking_platform: input.booking_platform ?? null,
  booking_platform_logo: input.booking_platform_logo ?? null,
  contact_phone: input.contact_phone ?? null,
  contact_email: input.contact_email ?? null,
  amenities: input.amenities ?? [],
  photo_url: input.photo_url ?? null,
  photo_path: input.photo_path ?? null,
  notes: input.notes ?? null,
});

/**
 * Patch parziale: include SOLO le chiavi effettivamente presenti in `input`,
 * così un update chirurgico (es. solo photo_url dopo la creazione) non azzera
 * name/type né gli altri campi. `null` è un valore valido (azzera il campo) e
 * viene risolto dall'operatore `??` dell'update.
 */
const accPatch = (input: Partial<AccommodationInput>): Partial<AccommodationInput> => {
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    patch[key] = value;
  }
  return patch as Partial<AccommodationInput>;
};

export const createAccommodation = async (
  tripId: string,
  input: AccommodationInput
): Promise<AccommodationRow> => {
  const { data, error } = await supabase
    .from('accommodations')
    .insert({ trip_id: tripId, ...accFields(input) })
    .select()
    .single();
  if (error) throw error;
  return data as AccommodationRow;
};

export const updateAccommodation = async (
  id: string,
  input: Partial<AccommodationInput>
): Promise<AccommodationRow> => {
  // Genuinely partial — vedi il commento di accPatch: un chiamante che passa
  // solo { check_in_date } non deve azzerare address/cost/notes/ecc.
  const patch = accPatch(input);
  const { data, error } = await supabase
    .from('accommodations')
    .update(patch)
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
  departure_terminal?: string | null;
  arrival_terminal?: string | null;
  airline?: string | null;
  flight_number?: string | null;
  booking_ref?: string | null;
  notes?: string | null;
  has_backpack?: boolean | null;
  has_carry_on?: boolean | null;
  has_checked_baggage?: boolean | null;
  has_seat?: boolean | null;
  has_cabin?: boolean | null;
  has_car_on_ferry?: boolean | null;
  has_deck_passage?: boolean | null;
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

/** Mezzi di più viaggi in una sola richiesta (per l'atlante). */
export const fetchTransportsForTrips = async (tripIds: string[]): Promise<TransportRow[]> => {
  if (tripIds.length === 0) return [];
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .in('trip_id', tripIds)
    .order('departure_datetime', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as TransportRow[];
};

/** Segni a mano dell'utente sull'atlante (paesi e regioni). */
export const fetchAtlasMarks = async (): Promise<AtlasMarkRow[]> => {
  const { data, error } = await supabase.from('atlas_marks').select('*');
  if (error) throw error;
  return (data ?? []) as AtlasMarkRow[];
};

export const setAtlasMark = async (countryCode: string, regionKey: string, marked: boolean): Promise<void> => {
  const { error } = marked
    ? await supabase.from('atlas_marks').insert({ country_code: countryCode, region_key: regionKey })
    : await supabase.from('atlas_marks').delete().eq('country_code', countryCode).eq('region_key', regionKey);
  if (error) throw error;
};

/** Toglie tutti i segni a mano di un paese (il paese intero e le sue regioni). */
export const clearAtlasMarks = async (countryCode: string): Promise<void> => {
  const { error } = await supabase.from('atlas_marks').delete().eq('country_code', countryCode);
  if (error) throw error;
};

/** Codice paese (alpha-2 maiuscolo) -> continente, dalla tabella country_continents. */
export const fetchCountryContinents = async (): Promise<Map<string, string>> => {
  const { data, error } = await supabase.from('country_continents').select('code, continent');
  if (error) throw error;
  return new Map((data ?? []).map((r) => [r.code.toUpperCase(), r.continent]));
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
      departure_terminal: input.departure_terminal ?? null,
      arrival_terminal: input.arrival_terminal ?? null,
      airline: input.airline ?? null,
      flight_number: input.flight_number ?? null,
      booking_ref: input.booking_ref ?? null,
      notes: input.notes ?? null,
      has_backpack: input.has_backpack ?? null,
      has_carry_on: input.has_carry_on ?? null,
      has_checked_baggage: input.has_checked_baggage ?? null,
      has_seat: input.has_seat ?? null,
      has_cabin: input.has_cabin ?? null,
      has_car_on_ferry: input.has_car_on_ferry ?? null,
      has_deck_passage: input.has_deck_passage ?? null,
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
  // Genuinely partial — see the comment on updateActivity for why this
  // matters: a caller passing e.g. just `{ departure_datetime }` (dragging
  // the event to a new time) must not wipe out airline/flight_number/etc.
  const patch: Partial<TransportRow> = {};
  if (input.transport_type !== undefined) patch.transport_type = input.transport_type;
  if (input.departure_airport !== undefined) patch.departure_airport = input.departure_airport;
  if (input.arrival_airport !== undefined) patch.arrival_airport = input.arrival_airport;
  if (input.departure_datetime !== undefined) patch.departure_datetime = input.departure_datetime;
  if (input.arrival_datetime !== undefined) patch.arrival_datetime = input.arrival_datetime;
  if (input.departure_terminal !== undefined) patch.departure_terminal = input.departure_terminal;
  if (input.arrival_terminal !== undefined) patch.arrival_terminal = input.arrival_terminal;
  if (input.airline !== undefined) patch.airline = input.airline;
  if (input.flight_number !== undefined) patch.flight_number = input.flight_number;
  if (input.booking_ref !== undefined) patch.booking_ref = input.booking_ref;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.has_backpack !== undefined) patch.has_backpack = input.has_backpack;
  if (input.has_carry_on !== undefined) patch.has_carry_on = input.has_carry_on;
  if (input.has_checked_baggage !== undefined) patch.has_checked_baggage = input.has_checked_baggage;
  if (input.has_seat !== undefined) patch.has_seat = input.has_seat;
  if (input.has_cabin !== undefined) patch.has_cabin = input.has_cabin;
  if (input.has_car_on_ferry !== undefined) patch.has_car_on_ferry = input.has_car_on_ferry;
  if (input.has_deck_passage !== undefined) patch.has_deck_passage = input.has_deck_passage;

  const { data, error } = await supabase.from('flights').update(patch).eq('id', id).select().single();
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
// Expenses (stile Tricount): spese, ripartizioni e categorie personalizzate
// ----------------------------------------------------------------------------

// Ordine di visualizzazione delle categorie predefinite; le personalizzate
// (con icona) stanno in expense_categories.
export const EXPENSE_CATEGORIES = [
  'cibo',
  'alloggi',
  'trasporti',
  'auto',
  'attrazioni',
  'escursioni',
  'shopping',
  'souvenir',
  'divertimento',
  'salute',
  'altro',
] as const;

export interface ExpenseSplitInput {
  participant_id: string;
  amount: number;
  shares: number;
}

export interface ExpenseInput {
  kind: ExpenseKind;
  title: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  category: string | null;
  expense_date: string;
  payer_participant_id: string;
  split_mode: ExpenseSplitMode;
  notes: string | null;
  splits: ExpenseSplitInput[];
}

export const fetchExpenses = async (tripId: string): Promise<ExpenseWithSplits[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, expense_splits(*)')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  // numeric arriva come stringa da PostgREST quando supera la precisione di JS:
  // si normalizza tutto a number una volta sola, qui.
  return ((data ?? []) as ExpenseWithSplits[]).map((e) => ({
    ...e,
    amount: Number(e.amount),
    exchange_rate: Number(e.exchange_rate),
    expense_splits: (e.expense_splits ?? []).map((s) => ({
      ...s,
      amount: Number(s.amount),
      shares: Number(s.shares),
    })),
  }));
};

/** Crea (id assente) o aggiorna una spesa insieme alla sua ripartizione, in
 * un'unica transazione lato DB (RPC save_expense). */
export const saveExpense = async (tripId: string, input: ExpenseInput, id?: string): Promise<string> => {
  const { splits, ...expense } = input;
  const { data, error } = await supabase.rpc('save_expense', {
    p_expense: { ...expense, id: id ?? null, trip_id: tripId },
    p_splits: splits.map((s) => ({ ...s })),
  });
  if (error) throw error;
  return data as string;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
};

export const fetchExpenseCategories = async (tripId: string): Promise<ExpenseCategoryRow[]> => {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ExpenseCategoryRow[];
};

export const createExpenseCategory = async (
  tripId: string,
  name: string,
  icon: string
): Promise<ExpenseCategoryRow> => {
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({ trip_id: tripId, name, icon })
    .select()
    .single();
  if (error) throw error;
  return data as ExpenseCategoryRow;
};

export const updateTripExpenseCurrency = async (tripId: string, currency: string): Promise<void> => {
  const { error } = await supabase.from('trips').update({ expense_currency: currency }).eq('id', tripId);
  if (error) throw error;
};

/** True se il partecipante ha pagato o condiviso almeno una spesa del viaggio:
 * in quel caso non si può rimuovere (vedi explainParticipantFkError). */
export const participantHasExpenses = async (participantId: string): Promise<boolean> => {
  const [paid, shared] = await Promise.all([
    supabase.from('expenses').select('id', { count: 'exact', head: true }).eq('payer_participant_id', participantId),
    supabase.from('expense_splits').select('expense_id', { count: 'exact', head: true }).eq('participant_id', participantId),
  ]);
  if (paid.error) throw paid.error;
  if (shared.error) throw shared.error;
  return (paid.count ?? 0) + (shared.count ?? 0) > 0;
};

/** Un partecipante che compare in una spesa non si può rimuovere (FK su
 * trip_participants, vedi migration 0038): il codice 23503 diventa un
 * messaggio comprensibile invece dell'errore grezzo di Postgres. */
const explainParticipantFkError = (error: { code?: string }) =>
  error.code === '23503' ? new Error(i18n.t('expenses.participantHasExpenses')) : error;

// ----------------------------------------------------------------------------
// Condivisione viaggio: inviti e partecipanti
// ----------------------------------------------------------------------------

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
export const respondToInvite = async (
  participantId: string,
  accept: boolean,
  companionId?: string | null
): Promise<void> => {
  const { error } = await supabase.rpc('respond_to_invite', {
    participant_id: participantId,
    accept,
    companion_id: companionId ?? null,
  });
  if (error) throw error;
};

/** Compagni di viaggio non ancora collegati a un account, tra cui l'invitato
 * sceglie "chi è" quando accetta l'invito. */
export const fetchInviteCompanions = async (participantId: string): Promise<InviteCompanion[]> => {
  const { data, error } = await supabase.rpc('fetch_invite_companions', {
    invite_participant_id: participantId,
  });
  if (error) throw error;
  return data ?? [];
};

export interface CompanionDraft {
  /** Presente solo per i compagni già salvati. */
  id?: string;
  name: string;
}

/** Allinea i compagni senza account di un viaggio alla lista desiderata:
 * crea i nuovi, rinomina quelli esistenti e rimuove quelli tolti. Tocca solo
 * i compagni non ancora collegati (user_id nullo). */
export const syncCompanions = async (
  tripId: string,
  existing: CompanionDraft[],
  desired: CompanionDraft[]
): Promise<void> => {
  const keptIds = new Set(desired.filter((d) => d.id).map((d) => d.id));
  const toDelete = existing.filter((e) => e.id && !keptIds.has(e.id));
  const toRename = desired.filter((d) => {
    const prev = existing.find((e) => e.id === d.id);
    return d.id && prev && prev.name !== d.name;
  });
  const toCreate = desired.filter((d) => !d.id);

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('trip_participants')
      .delete()
      .in('id', toDelete.map((d) => d.id as string))
      .is('user_id', null);
    if (error) throw explainParticipantFkError(error);
  }
  for (const d of toRename) {
    const { error } = await supabase
      .from('trip_participants')
      .update({ display_name: d.name })
      .eq('id', d.id as string)
      .is('user_id', null);
    if (error) throw error;
  }
  if (toCreate.length > 0) {
    const { error } = await supabase.from('trip_participants').insert(
      toCreate.map((d) => ({
        trip_id: tripId,
        user_id: null,
        role: 'viewer' as const,
        status: 'accepted' as const,
        display_name: d.name,
      }))
    );
    if (error) throw error;
  }
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

/** Rimuove un partecipante tramite RPC (solo proprietario): se aveva un account ed
 * era già dentro, la funzione gli lascia anche una notifica di rimozione. */
export const removeParticipant = async (participantId: string): Promise<void> => {
  const { error } = await supabase.rpc('remove_trip_participant', { participant_id: participantId });
  if (error) throw explainParticipantFkError(error);
};

export const fetchMyTripNotifications = async (): Promise<TripNotification[]> => {
  const { data, error } = await supabase
    .from('trip_notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TripNotification[];
};

export const dismissTripNotification = async (id: string): Promise<void> => {
  const { error } = await supabase.from('trip_notifications').delete().eq('id', id);
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
/** Per ogni altro utente, in quanti viaggi (con invito accettato) è stato insieme a `userId`. */
export const fetchSharedTripCounts = async (userId: string): Promise<Map<string, number>> => {
  const { data: mine, error } = await supabase
    .from('trip_participants')
    .select('trip_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');
  if (error) throw error;
  const tripIds = (mine ?? []).map((r) => r.trip_id);
  if (tripIds.length === 0) return new Map();
  const { data: others, error: othersError } = await supabase
    .from('trip_participants')
    .select('trip_id, user_id')
    .in('trip_id', tripIds)
    .eq('status', 'accepted')
    .neq('user_id', userId);
  if (othersError) throw othersError;
  const counts = new Map<string, number>();
  for (const r of others ?? []) {
    if (r.user_id) counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1);
  }
  return counts;
};

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