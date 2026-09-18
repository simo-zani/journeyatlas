// ===========================================================================
// Icone nelle modali e nei controlli dei form
// ---------------------------------------------------------------------------
// REGOLA: le icone decorative/contenuto dentro modali, form e barre di stato
// usano SEMPRE `w-5 h-5` (20px). È la dimensione dell'icona del calendario
// che il browser mostra nei campi `<input type="date">` (es. "Data fine" in
// TripForm): confrontata con quella, ogni icona più piccola (w-4/w-3) appare
// minuscola e va evitata.
//
// Fanno eccezione SOLO:
//   - gli spinner di caricamento (Loader2 animate-spin)
//   - i micro-elementi passivi come MapPin inline nelle righe compatte
//   - le X di chiusura (già w-5 h-5 su Modal)
// ===========================================================================
export const MODAL_ICON_SIZE = 'w-5 h-5';