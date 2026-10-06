/** Operatori di prenotazione di attività/esperienze più noti. Il logo è il favicon del dominio. */
export const ACTIVITY_OPERATORS = [
  { name: 'GetYourGuide', domain: 'getyourguide.com' },
  { name: 'Viator', domain: 'viator.com' },
  { name: 'Klook', domain: 'klook.com' },
  { name: 'Tiqets', domain: 'tiqets.com' },
  { name: 'Civitatis', domain: 'civitatis.com' },
  { name: 'Musement', domain: 'musement.com' },
  { name: 'Headout', domain: 'headout.com' },
  { name: 'TripAdvisor', domain: 'tripadvisor.com' },
  { name: 'Airbnb Experiences', domain: 'airbnb.com' },
  { name: 'Booking.com', domain: 'booking.com' },
  { name: 'Fever', domain: 'feverup.com' },
  { name: 'Eventbrite', domain: 'eventbrite.com' },
  { name: 'Ticketmaster', domain: 'ticketmaster.com' },
  { name: 'TicketOne', domain: 'ticketone.it' },
  { name: 'Vivaticket', domain: 'vivaticket.com' },
  { name: 'Go City', domain: 'gocity.com' },
] as const;

export const operatorDomain = (name: string | null | undefined): string | null => {
  const n = name?.trim().toLowerCase();
  if (!n) return null;
  return ACTIVITY_OPERATORS.find((o) => o.name.toLowerCase() === n)?.domain ?? null;
};
