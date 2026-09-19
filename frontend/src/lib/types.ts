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
  is_public: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type ProfileRow = {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  default_currency: string | null;
  timezone: string | null;
  created_at: string;
};

export type ParticipantStatus = 'pending' | 'accepted' | 'declined';

export type TripParticipantRow = {
  id: string;
  trip_id: string;
  user_id: string | null;
  role: Role;
  status: ParticipantStatus;
  invited_email: string | null;
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
};

export type ProfileSearchResult = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export type PendingInvite = {
  participant_id: string;
  trip_id: string;
  trip_name: string;
  trip_cover_image_url: string | null;
  role: Role;
  invited_by_username: string | null;
  created_at: string;
};

export type TripParticipantDetail = {
  participant_id: string;
  user_id: string | null;
  role: Role;
  status: ParticipantStatus;
  joined_at: string | null;
  created_at: string;
  username: string | null;
  avatar_url: string | null;
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

export type FriendStatus = 'friends' | 'outgoing' | 'incoming' | 'self' | null;

export type TravelerSearchResult = {
  id: string;
  username: string;
  avatar_url: string | null;
  friend_status: FriendStatus;
};

export type IncomingFriendRequest = {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type TravelerProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  friend_status: FriendStatus;
  friendship_id: string | null;
  countries_visited: number;
  continents_visited: number;
  total_trips_count?: number;
  public_trips_count: number;
};

export type PublicTripRow = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  destinations: Destination[] | null;
  cover_image_url: string | null;
  cover_position_y: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      trips: {
        Row: TripRow;
        Insert: Partial<TripRow>;
        Update: Partial<TripRow>;
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          responded_at: string | null;
        };
        Insert: Partial<{
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'declined';
          responded_at: string | null;
        }>;
        Update: Partial<{
          status: 'pending' | 'accepted' | 'declined';
          responded_at: string | null;
        }>;
        Relationships: [];
      };
      country_continents: {
        Row: { code: string; continent: string };
        Insert: Partial<{ code: string; continent: string }>;
        Update: Partial<{ code: string; continent: string }>;
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
    Functions: {
      username_exists: {
        Args: { check_username: string };
        Returns: boolean;
      };
      search_profiles_by_username: {
        Args: { search_query: string; for_trip_id: string };
        Returns: ProfileSearchResult[];
      };
      fetch_pending_invites: {
        Args: Record<string, never>;
        Returns: PendingInvite[];
      };
      respond_to_invite: {
        Args: { participant_id: string; accept: boolean };
        Returns: void;
      };
      fetch_trip_participants: {
        Args: { for_trip_id: string };
        Returns: TripParticipantDetail[];
      };
      search_travelers: {
        Args: { search_query: string };
        Returns: TravelerSearchResult[];
      };
      get_popular_travelers: {
        Args: Record<string, never>;
        Returns: TravelerSearchResult[];
      };
      record_profile_view: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
      get_friends: {
        Args: Record<string, never>;
        Returns: TravelerSearchResult[];
      };
      get_incoming_friend_requests: {
        Args: Record<string, never>;
        Returns: IncomingFriendRequest[];
      };
      count_incoming_friend_requests: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_traveler_profile: {
        Args: { target_user_id: string };
        Returns: TravelerProfile[];
      };
      get_public_trips_for_user: {
        Args: { target_user_id: string };
        Returns: PublicTripRow[];
      };
      send_friend_request: {
        Args: { addressee_id: string };
        Returns: string;
      };
      respond_to_friend_request: {
        Args: { friendship_id: string; accept: boolean };
        Returns: void;
      };
      set_trip_public: {
        Args: { trip_id: string; is_public: boolean };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};