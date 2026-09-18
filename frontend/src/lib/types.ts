export type Role = 'owner' | 'editor' | 'viewer';

export type Destination = {
  city: string;
  country: string;
  countryCode?: string | null;
  coords?: { lat: number; lon: number } | null;
};

export type Coordinates = { lat: number; lon: number };

export type TripRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  destinations: Destination[] | null;
  budget_planned: number | null;
  cover_image_url: string | null;
  cover_position_y: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type TripParticipantRow = {
  id: string;
  trip_id: string;
  user_id: string | null;
  role: Role;
  invited_email: string | null;
  joined_at: string | null;
};

export type ActivityRow = {
  id: string;
  trip_id: string;
  name: string;
  description: string | null;
  activity_date: string | null;
  activity_time: string | null;
  location_city: string | null;
  location_address: string | null;
  category: string | null;
  status: 'planned' | 'booked' | 'completed';
  booking_ref: string | null;
  notes: string | null;
  created_by_user_id: string;
  created_at: string;
};

export type TransportType =
  | 'flight'
  | 'train'
  | 'bus'
  | 'ferry'
  | 'car'
  | 'other';

export type TransportRow = {
  id: string;
  trip_id: string;
  transport_type: TransportType;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string | null;
  arrival_datetime: string | null;
  airline: string | null;
  flight_number: string | null;
  booking_ref: string | null;
  passengers: unknown[] | null;
  notes: string | null;
  created_at: string;
};

export type AccommodationRow = {
  id: string;
  trip_id: string;
  name: string;
  type: 'hotel' | 'airbnb' | 'house' | 'apartment';
  address: string | null;
  coordinates: Coordinates | null;
  check_in_date: string | null;
  check_in_time: string | null;
  check_out_date: string | null;
  check_out_time: string | null;
  cost_total: number | null;
  currency: string | null;
  rooms: unknown[] | null;
  contact_info: unknown | null;
  booking_ref: string | null;
  notes: string | null;
  created_at: string;
};

export type ChecklistItemRow = {
  id: string;
  trip_id: string;
  name: string;
  category: string | null;
  quantity: number;
  notes: string | null;
  packed: boolean;
  packed_by_user_id: string | null;
  packed_at: string | null;
  created_by_user_id: string;
  created_at: string;
};

export type ChecklistItemCategory =
  | 'documenti'
  | 'abbigliamento'
  | 'toilette'
  | 'elettronica'
  | 'salute'
  | 'altro';

export type ChecklistCategoryRow = {
  id: string;
  trip_id: string;
  name: string;
  icon: string;
  created_at: string;
};

export type Trip = TripRow & { participants?: TripParticipantRow[] };

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: TripRow;
        Insert: Partial<TripRow>;
        Update: Partial<TripRow>;
        Relationships: [];
      };
      trip_participants: {
        Row: TripParticipantRow;
        Insert: Partial<TripParticipantRow>;
        Update: Partial<TripParticipantRow>;
        Relationships: [];
      };
      activities: {
        Row: ActivityRow;
        Insert: Partial<ActivityRow>;
        Update: Partial<ActivityRow>;
        Relationships: [];
      };
      flights: {
        Row: TransportRow;
        Insert: Partial<TransportRow>;
        Update: Partial<TransportRow>;
        Relationships: [];
      };
      accommodations: {
        Row: AccommodationRow;
        Insert: Partial<AccommodationRow>;
        Update: Partial<AccommodationRow>;
        Relationships: [];
      };
      checklist_items: {
        Row: ChecklistItemRow;
        Insert: Partial<ChecklistItemRow>;
        Update: Partial<ChecklistItemRow>;
        Relationships: [];
      };
      checklist_categories: {
        Row: ChecklistCategoryRow;
        Insert: Partial<ChecklistCategoryRow>;
        Update: Partial<ChecklistCategoryRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};