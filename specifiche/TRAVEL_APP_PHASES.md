# Travel App - Roadmap Fasi

## Stato Progetto

| Fase | Nome | Status | Completamento |
|------|------|--------|----------------|
| 1 | MVP Core (Auth + Viaggio Base) | 🟡 In Progress | 82% |
| 2 | Packing + Expense Split | ⏳ Not Started | 0% |
| 3 | Info Paese + Documenti + Chat | ⏳ Not Started | 0% |
| 4 | Timeline + Notifiche + Post-Report | ⏳ Not Started | 0% |
| 5 | Dashboard Analytics + Scratch Map | ⏳ Not Started | 0% |
| 6 | Admin Dashboard (metriche servizio) | ⏳ Not Started | 0% |

**Ultimo aggiornamento:** 2026-09-18  
**Prossima milestone:** Fase 1 — testing generale (1.10), poi import Notion (1.11) e PWA mobile (1.4). Il flusso di condivisione/inviti (1.9) è completo.

---

## FASE 1: MVP Core - Auth + Viaggio Base

**Durata stimata:** 1-2 settimane  
**Deliverable:** Web app funzionante con viaggio basic, inviti, attività/alloggi/voli

### 1.1 Setup Infrastruttura
- [x] Creare progetto ASP.NET Core (Minimal APIs)
- [x] Setup React TypeScript + Tailwind + shadcn
- [x] Supabase project setup (database, auth, storage) — migrazioni `0001`→`0010` applicate nel SQL Editor
- [x] Environment variables e secrets management (`frontend/.env.local` + `.env.example`)
- [ ] Docker setup (opzionale per dev)
- [~] PWA setup: manifest.json fatto, service worker e icone mancanti
- [x] i18next + react-i18next setup
- [x] Tailwind dark mode config
- **Status:** 🟡 In Progress

### 1.1b Design System & Branding
- [x] Importare font Poppins e Inter (Google Fonts)
- [x] Configurare Tailwind per palette blu/oro/cream
- [x] Creare componenti base styled (Button, Card, Input)
- [x] Setup tema dark mode (localStorage persistence)
- [~] Test colori su light e dark mode
- **Status:** 🟢 Done

### 1.1c Internazionalizzazione (i18n)
- [x] Creare struttura /public/locales/{en,it}/translation.json
- [~] Scrivere traduzioni base (common, nav, dashboard, trip sections) — auth e dashboard aggiunte, espandere con le nuove sezioni
- [x] Setup i18n config nel progetto React
- [x] Language selector nel header/settings
- [x] Test switch language (reload UI)
- [x] Assicurare localStorage persistence lingua
- **Status:** 🟡 In Progress

### 1.2 Autenticazione
- [x] Supabase Auth integration (email/password) — testata, funzionante
- [ ] OAuth Google setup
- [ ] OAuth Apple setup
- [x] Login form UI — redisegnata senza riquadro Card, campi liberi sullo sfondo
- [x] Signup form UI — idem, più campo username obbligatorio (vedi 1.9)
- [x] Cambio password (modale Profilo, `supabase.auth.updateUser`)
- [x] Logout + session management
- [x] Protected routes (redirect if not authenticated)
- [x] User profile API endpoint (`fetchProfile`/`updateProfile` in `lib/api.ts`)
- **Status:** 🟡 In Progress (manca solo OAuth)

### 1.3 Database & Migrations
- [x] Creare tabelle: trips, trip_participants, activities, flights, accommodations, profiles — `0001_init.sql` applicata
- [~] Row-level security policies — presenti per trips/activities/ecc. dalla migration iniziale, ma **mancavano del tutto su `profiles`** (nessuna policy = nessun accesso, nemmeno per il proprietario): bug reale scoperto e corretto in `0010_profiles_rls.sql`. Da fare ancora: audit delle altre tabelle per verificare non ci siano altre lacune simili
- [x] Indexes su foreign keys
- [x] Triggers per updated_at auto
- **Status:** 🟡 In Progress

### 1.4 Responsive Mobile & PWA UI
- [~] Verificare layout mobile-first (mobile 0-640px) — header/sidebar/forms responsive, test su device pendente
- [~] Test touch-friendly buttons (min 44x44px) — rispettato nei componenti
- [ ] "Add to Home Screen" prompt (custom UI o WebKit)
- [ ] Test su iPhone real device (o simulator)
- [ ] Test dark/light mode toggle on mobile
- [ ] Language selector accessibility on mobile
- [ ] Verificare manifest.json icons e splash screen
- **Status:** ⏳ Not Started

### 1.5 Dashboard Principale
- [x] Layout dashboard (header con logo/theme toggle/language, sidebar, main area)
- [x] Logo + branding in header (premium blue/gold)
- [x] Lista viaggi corrente (card grid, responsive 1-2-3 columns)
- [x] Card viaggio con bandiere dei paesi delle mete (`TripFlags`, deduplicate)
- [x] Viaggi raggruppati per stato: In corso / Programmati / Completati (in base alla data odierna)
- [x] Button "Crea Nuovo Viaggio" (prominent, gold accent)
- [~] Modal/form creazione viaggio
  - [x] Input: nome, mete, date, budget
  - [x] Integrazione geocoder mete (Nominatim/OSM) — trova città reali (es. "New York", "Venezia"), nomi in italiano via accept-language, nessuna chiave
  - [x] Bandiere come immagini dal CDN gratuito REST Countries (emoji non renderizzate su Windows) — niente chiave
  - [ ] Integrazione Unsplash API (suggerimento immagine)
  - [x] Salva a DB
- [x] Card styling: deep blue border, gold accents
- [x] Redirect a viaggio dopo creazione
- **Status:** 🟡 In Progress

### 1.5 Dettaglio Viaggio - Layout Base
- [ ] Sidebar con 9 sezioni (Attività, Alloggi, Voli, Packing, Expense, Info, Documenti, Chat, Report)
- [x] Header con nome viaggio, date, partecipanti
- [x] Tab navigation (Attività/Alloggi/Voli/Check List attive, altre sezioni disabilitate "coming soon")
- [x] Modifica viaggio dal dettaglio (nome, date, mete, budget) — modal `TripForm` in modalità edit, `updateTrip` API
- [x] Bandiere dei paesi delle mete nel header del viaggio (una per paese, deduplicate; codice paese salvato in `countryCode` e risolto via Nominatim per i viaggi esistenti, con cache localStorage)
- **Status:** 🟡 In Progress (sidebar pro futuro, per ora tab bar)

### 1.6 Sezione Attività
- [x] Form aggiungi attività (nome, descrizione, data, orario, luogo, categoria, status)
- [x] Lista attività con filtri (per status, per categoria)
- [x] Edit/delete attività
- [x] API endpoints (CRUD - supabase direct, senza backend esterno per ora)
- **Status:** ✅ Done

### 1.7 Sezione Alloggi
- [x] Form aggiungi alloggio (nome, tipo, indirizzo, check-in/out, costo, contatti, note)
- [x] Lista alloggi
- [x] Edit/delete
- [x] API endpoints
- **Status:** ✅ Done

### 1.8 Sezione Mezzi (ex Voli)
- [x] Tab rinominata da "Voli" a "Mezzi" (i18n IT/EN)
- [x] Migration `0005_transport_type.sql` (colonna `transport_type` con valori flight/train/bus/ferry/car/other)
- [x] Selettore tipo di mezzo nel form (aereo, treno, pullman, traghetto, auto, altro) con icone
- [x] Etichette dinamiche: aeroporti per voli, stazione/città per gli altri mezzi
- [x] Badge tipo mezzo nelle card
- [x] Form aggiungi mezzo (passeggeri, bagagli - da aggiungere)
- [x] Form aggiungi mezzo (aeroporti, date/orari, compagnia, numero, booking ref)
- [x] Lista mezzi
- [x] Edit/delete
- [x] API endpoints
- **Status:** ✅ Done (mancano solo passeggeri/bagagli)

### 1.8b Sezione Check List (ex Packing)
- [x] Tab rinominato da "Packing" a "Check List" (i18n IT/EN)
- [x] Migration `0002_checklist.sql` (tabella `checklist_items` + RLS)
- [x] Form aggiungi voce (nome, categoria, quantità, note)
- [x] Checkbox "preparato" (toggle packed + chi/quando)
- [x] Barra di progresso (X/Y preparato)
- [x] Filtri per categoria e stato (da preparare/preparato)
- [x] Edit/delete voci
- [x] API endpoints CRUD
- [x] Durata viaggio nel header (giorni, notti)
- [x] Icona calendario ingrandita nel header, separatore data senza em-dash
- [x] Categorie personalizzabili (migration `0003` rimuove il CHECK constraint)
- [x] Icona personalizzabile per categoria (migration `0004` tabella `checklist_categories`, set Lucide)
- **Status:** ✅ Done
- **Nota:** funzioni avanzate (per persona, template condivisi) in Fase 2

### 1.9 Condivisione Viaggio & Partecipanti

#### Architettura dati
- Il viaggio **non viene duplicato**: esiste un'unica riga in `trips`.  
- La tabella `trip_participants` (già in `0001_init.sql`) è la **join table** che associa utenti a un viaggio con il proprio ruolo.
- Ogni utente che ha accesso al viaggio (owner + partecipanti accettati) lo vede nella propria dashboard tramite una query su `trip_participants`.
- La dashboard già esegue `fetchMyTrips` filtrata per `owner_id = me` — va estesa a includere anche i viaggi dove `trip_participants.user_id = me AND joined_at IS NOT NULL`.

#### Username univoco (prerequisito) — ✅ fatto, con alcune scelte diverse dal piano originale
- [x] Migration `0008_username.sql`: colonna `username text` su `public.profiles`
  - Constraint formato: `[A-Za-z0-9_.-]+` (lettere/numeri/underscore/trattino/punto, niente spazi né `@`)
  - Univocità **case-insensitive** via unique index su `lower(username)` (non un semplice `unique`, per evitare "Simo" vs "simo")
- [x] RPC `username_exists(check_username)` — `security definer`, usata dal form invece di una query diretta su `profiles` (non espone righe, solo un booleano)
- [~] Trigger `handle_new_user` aggiornato: legge `username` da `raw_user_meta_data` (passato da `supabase.auth.signUp({ options: { data: { username } } })`). **Scelta diversa dal piano**: username obbligatorio già in fase di signup, niente generazione automatica da email + suffisso — semplifica il flusso ma richiede sempre l'input dell'utente
- [x] Modale "Profilo" (icona/riga account nella sidebar): foto avatar (drag&drop, compressa sempre <500KB), username modificabile (icona matita, stile `@handle`), cambio password
- [~] Validazione realtime: il **formato** è filtrato live mentre scrivi (caratteri non validi semplicemente non vengono accettati); la **disponibilità** è controllata al submit, non con debounce mentre scrivi — da rifinire se serve un feedback ✓/✗ istantaneo
- [x] Migration `0009_storage_avatars.sql`: bucket storage `avatars` (stesse policy di `trip-covers`: lettura pubblica, scrittura solo proprietario)
- [x] Migration `0010_profiles_rls.sql`: RLS mancante su `profiles` (vedi 1.3) — necessaria perché il modale Profilo funzionasse
- [x] Script di backfill eseguito per l'utente esistente pre-feature (`simo1696@tiscali.it` → username `simo_zani`)
- **Status:** 🟢 Done (resta solo l'eventuale debounce live sulla disponibilità, non bloccante)

#### Flusso invito — ✅ fatto
- [x] Migration `0011_invite_status.sql`: colonne `status` (`pending`/`accepted`/`declined`, default `accepted` per non rompere le righe owner già esistenti) e `invited_by` su `trip_participants`
- [x] UI "Condividi viaggio": icona "Users" nella header del dettaglio viaggio (era un placeholder disabilitato, ora attiva per tutti — la ricerca/gestione resta owner-only dentro il modale) → `ShareTripModal`
- [x] Modal di invito: campo di ricerca username con debounce 300ms
  - RPC `search_profiles_by_username(search_query, for_trip_id)` — `security definer`, esclude se stessi e chi è già coinvolto (qualsiasi stato), niente query diretta su `profiles` (bloccata dalla RLS 0010)
  - Mostra avatar + @username nei risultati (niente `display_name`, non ancora usato altrove nell'app)
- [x] Selezione ruolo al momento dell'invito: **Editor** o **Viewer** (segmented control sopra i risultati di ricerca)
- [x] Click "Invita": insert diretto in `trip_participants` (`status='pending'`, `invited_by=owner_uid`) — già protetto dalla policy insert esistente (`is_trip_owner(trip_id)`), nessuna nuova policy necessaria
- [ ] Notifica in-app all'invitato — per ora l'invitato la vede solo tornando/aprendo la dashboard (sezione "Inviti in sospeso"); badge/campanella resta da fare in Fase 3
- **Status:** 🟢 Done (manca solo la notifica push/badge, rimandata)

> 🔭 **Evoluzione futura pianificata** (non ancora implementata, da fare insieme al sistema di notifiche in Fase 4 / 4.1):
> - **Invito anche a chi non ha un account**: oltre alla ricerca per username (quella attuale, per chi è già registrato), aggiungere un invito "esterno" via link condivisibile su WhatsApp/Telegram/email — la persona invitata si registra (o si logga) e il link la collega automaticamente all'invito in sospeso.
> - **Sistema Amici**: introdurre gli amici come relazione di livello app (non per-singolo-viaggio) — la ricerca per username che oggi vive dentro il modale "Condividi viaggio" si sposterà in una sezione "Amici" dedicata (richiesta/accetta/rifiuta amicizia, lista amici). Una volta fatto, **l'invito a un viaggio sarà possibile solo verso i propri amici**, non verso qualsiasi utente cercato — `ShareTripModal` andrà quindi aggiornato per proporre la lista amici invece della ricerca globale attuale.

#### Accettazione / Rifiuto — ✅ fatto
- [x] Sezione "Inviti in sospeso" in dashboard (sopra la lista viaggi, `PendingInvites` — invisibile se non ci sono pending)
- [x] Card invito: nome viaggio + cover, chi ha invitato, ruolo proposto, pulsanti **Accetta** / **Rifiuta**
- [x] Accetta → RPC `respond_to_invite(participant_id, true)` → `status='accepted'`, `joined_at=now()` → il viaggio appare alla successiva `fetchMyTrips` (già filtrava owned+shared, ora richiede anche `status='accepted'`)
- [x] Rifiuta → `respond_to_invite(participant_id, false)` → `status='declined'` (la riga resta per audit)
- **Nota tecnica**: un invitato "pending" non è ancora un partecipante accettato, quindi non potrebbe leggere `trips`/`profiles` di altri tramite le policy normali — la card invito usa la RPC `fetch_pending_invites()` (`security definer`) che ritorna solo i campi minimi necessari (nome viaggio, cover, chi ha invitato)
- **Status:** 🟢 Done

#### Gestione partecipanti (owner only) — ✅ fatto
- [x] Lista partecipanti nel modale "Condividi viaggio" (avatar, username, ruolo, stato pending/declined) via RPC `fetch_trip_participants` (stesso motivo delle altre RPC: niente accesso diretto a `profiles` altrui)
- [x] Owner può cambiare ruolo di un partecipante (Editor ↔ Viewer) in qualsiasi momento — select inline, non mostrato sulla riga dell'owner stesso
- [x] Owner può rimuovere un partecipante (delete row da `trip_participants`)
- [x] Owner non può rimuovere/modificare sé stesso — **solo lato UI** (il controllo non è mostrato sulla riga con `role='owner'`); non c'è ancora un vincolo lato DB che lo impedisca esplicitamente, da valutare se serve rinforzarlo
- **Status:** 🟢 Done (vedi nota sopra sul vincolo DB)

#### RLS & sicurezza — ✅ fatto
- Già presenti in `0001_init.sql`: `is_trip_participant()`, `can_edit_trip()`, `is_trip_owner()`
- [x] Le tre funzioni ora richiedono anche `status = 'accepted'` (migration 0011) — un invito pending non concede più accesso implicito a `trips`/`activities`/ecc., dato che tutte le policy esistenti si basano su queste funzioni
- [x] Policy `INSERT/UPDATE/DELETE` su `activities`, `accommodations`, `transport`, `checklist_items` già usavano `can_edit_trip(trip_id)` fin da `0001_init.sql` — nessuna modifica necessaria, si sono aggiornate automaticamente ereditando il nuovo controllo su `status`
- [x] Viewer: `SELECT` su tutte le sezioni (via `is_trip_participant`), nessun `INSERT/UPDATE/DELETE` (richiedono `can_edit_trip`, che esclude `role='viewer'`) — comportamento già corretto, solo verificato
- **Status:** 🟢 Done


### 1.10 Testing & Bugfix
- [ ] Test login/logout
- [ ] Test inviti
- [ ] Test CRUD attività/alloggi/voli
- [ ] Test autorizzazioni (row-level security)
- [ ] Test responsivo mobile
- [ ] Bugfix eventuali
- **Status:** ⏳ Not Started

### 1.11 Import da Notion (MVP)
- [ ] Pagina "/import" con drag-and-drop upload
- [ ] Parser CSV/JSON da Notion export
- [ ] Mapping automatico colonne (name, dates, destinations, budget)
- [ ] Preview import prima di salvare
- [ ] Batch save viaggi a DB
- [ ] Fallback: form manuale "Add Journey Skeleton" (nome + destinazioni + date)
- [ ] Notifica success/error
- [ ] Test con Notion export example
- **Status:** ⏳ Not Started

### 1.12a API esterne & privacy (prerequisito al deploy)
- [x] Ricerca mete via Nominatim/OSM — nessuna chiave API, nessun segreto nel bundle JS
- [x] Bandiere via CDN immagini REST Countries (gratis) — nessuna chiave
- [ ] Verificare Nominatim Usage Policy (≤ 1 req/s, Referer) e usare solo per dev/testing; se l'uso cresce valutare un proxy/memoizzazione (Edge Function) per il deploy
- **Status:** 🟡 In Progress (nessuna chiave da proteggere; resta da valutare il proxy se l'uso cresce)

### 1.12b Storage & Compressione Immagini

> **Obiettivo:** contenere il consumo di Supabase Storage (limite free: 1 GB) facendo in modo che ogni immagine di copertina pesi al massimo ~200 KB, indipendentemente dal file originale caricato dall'utente.

#### Strategia: compressione client-side prima dell'upload
- Tutta la riduzione avviene nel browser via **Canvas API** — nessuna dipendenza esterna necessaria
- Nessun dato transita su server solo per essere ridimensionato
- Il file inviato a Supabase Storage è già compresso → nessun post-processing lato server

#### Parametri target per le immagini di copertina
| Parametro | Valore | Motivo |
|---|---|---|
| Formato output | **WebP** | miglior rapporto qualità/peso; supportato da tutti i browser moderni |
| Aspect ratio | **16:9** (es. 960×540) | si adatta perfettamente alle card e al futuro dettaglio viaggio |
| Dimensioni max | 960 × 540 px | sufficiente per display retina su card; non eccessive |
| Dimensione file max | **200 KB** | ~5.000 immagini per esaurire 1 GB Storage → ampio margine |
| Qualità WebP | 0.82 (dinamica) | si abbassa automaticamente finché non si raggiunge il target KB |

#### Implementazione (lato frontend)
- [ ] Utility `compressCoverImage(file: File): Promise<Blob>` in `src/lib/imageUtils.ts`:
  1. Carica il file in un `<img>` element (URL.createObjectURL)
  2. Disegna su `<canvas>` con resize a 960×540 (crop centrato sul lato corto — `object-cover`)
  3. Esporta con `canvas.toBlob('image/webp', quality)` in loop finché `blob.size ≤ 200 KB` (abbassa quality di 0.05 per iterazione, min 0.4)
  4. Ritorna il `Blob` finale
- [ ] Il componente di upload (modale trip, futuro campo cover) chiama `compressCoverImage` prima di `supabase.storage.from('trip-covers').upload(...)`
- [ ] Preview istantanea dell'immagine compressa prima del salvataggio (mostra peso risultante)
- [ ] Feedback visivo durante compressione (spinner leggero)
- **Status:** ⏳ Not Started

#### Guardia lato Supabase Storage (difesa in profondità)
- [ ] Bucket `trip-covers`: impostare `maxFileSizeBytes = 512000` (512 KB) come ulteriore guard server-side — se per qualsiasi motivo la compressione client non gira, il server rifiuta
- [ ] RLS bucket: solo l'utente autenticato può caricare nel proprio path (`{user_id}/{trip_id}.webp`)
- [ ] Naming convention file: `{user_id}/{trip_id}.webp` — sovrascrivibile (update) senza proliferare copie
- **Status:** ⏳ Not Started

#### Impatto stimato sullo storage
| Scenario | Immagini | Peso medio | Totale |
|---|---|---|---|
| 100 utenti × 5 viaggi | 500 | 150 KB | **~75 MB** |
| 1.000 utenti × 5 viaggi | 5.000 | 150 KB | **~750 MB** |
| Soglia attenzione (75%) | — | — | 750 MB / 1 GB |



### 1.12 Deployment
- [ ] Deploy backend (es. Azure, Heroku)
- [ ] Deploy frontend (es. Vercel)
- [ ] Setup custom domain (opzionale)
- **Status:** ⏳ Not Started
- **Nota:** non è più necessario aggiungere alcun dominio/whitelist su REST Countries: l'autocomplete usa Nominatim/OSM senza chiave

**Checkpoint Fase 1:** Utente può creare un viaggio, invitare partecipanti, aggiungere attività/alloggi/voli, importare da Notion, collaborazione in tempo reale.

---

## FASE 2: Packing List + Expense Split

**Durata stimata:** 1-1.5 settimane  
**Prerequisiti:** Fase 1 completata  
**Deliverable:** Sistema packing list personalizzato + expense tracking avanzato

### 2.1 Sezione Packing List
- [ ] UI packing list per persona
- [ ] Form aggiungi item (categoria, nome, quantità, note)
- [ ] Checkbox "packed" items
- [ ] Edit/delete items
- [ ] Template salvati (es. "Estate Europa")
- [ ] Condivisione template tra utenti
- [ ] API endpoints CRUD
- **Status:** ⏳ Not Started

### 2.2 Sezione Expense Tracking - Base
- [ ] Form aggiungi spesa (chi ha pagato, importo, valuta, categoria, data, descrizione, note)
- [ ] Lista spese con filtri (per categoria, per data, per chi ha pagato)
- [ ] Edit/delete spesa
- [ ] API endpoints CRUD
- **Status:** ⏳ Not Started

### 2.3 Expense Split Logica
- [ ] Seleziona persone per cui splittare la spesa
- [ ] Opzioni split:
  - Equo (dividi per N persone)
  - Personalizzato (importi diversi per persona)
- [ ] Tasso cambio capture (al momento della spesa, consultabile)
- [ ] DB: tabella expense_splits con dettagli
- **Status:** ⏳ Not Started

### 2.4 ExchangeRate API Integration
- [ ] Registrazione su ExchangeRate-API (free tier)
- [ ] API call per tassi cambio (real-time)
- [ ] Caching tassi cambio per 1 ora
- [ ] Conversione automatica spese in valuta "base" (EUR o scelta utente)
- [ ] Salvataggio tasso cambio al momento della spesa (snapshot)
- **Status:** ⏳ Not Started

### 2.5 Riepilogo Spese & Debiti
- [ ] Dashboard "Riepilogo Spese"
  - Totale speso per categoria
  - Totale per persona
  - Chi ha pagato complessivamente
- [ ] Calcolo automatico debiti/crediti (chi deve rimborso a chi)
- [ ] UI intuitiva (tipo Splitwise: "Tizio deve 25 EUR a Caio")
- [ ] Esporta PDF riepilogo
- **Status:** ⏳ Not Started

### 2.6 Multi-Currency Handling
- [ ] Supporta spese in valute diverse nello stesso viaggio
- [ ] Conversione con tassi nel momento della spesa
- [ ] Display totale finale in valuta selezionata
- [ ] Test caso complesso: spese EUR, THB, USD nello stesso viaggio
- **Status:** ⏳ Not Started

### 2.7 Testing & Bugfix
- [ ] Test split equity scenarios
- [ ] Test multi-currency conversions
- [ ] Test rounding edge cases (cent, satang)
- [ ] Test export PDF
- **Status:** ⏳ Not Started

**Checkpoint Fase 2:** Sistema expense tracking completo, split intelligente, multi-currency, debiti chiari.

---

## FASE 3: Info Paese + Meteo + Documenti + Chat

**Durata stimata:** 1.5-2 settimane  
**Prerequisiti:** Fase 1 completata  
**Deliverable:** Info pratiche, meteo, upload documenti, chat collaborativo

### 3.1 Sezione Info Pratiche Paese
- [ ] Fetch dati da REST Countries API (fuso orario, valuta, lingue)
- [ ] Display info per meta selezionata
- [ ] Caching dati paese in DB (per performance)
- **Status:** ⏳ Not Started

### 3.2 Tasso Cambio Real-Time
- [ ] Sottosezione "Tassi Cambio" in Info Paese
- [ ] Input: seleziona valuta base (es. EUR)
- [ ] Mostra cambio verso valuta locale
- [ ] Aggiornamento ogni volta che apri sezione
- [ ] Caching 1 ora
- **Status:** ⏳ Not Started

### 3.3 Prese Elettriche
- [ ] Dataset paesi → tipi prese (A, B, C, F, G, I, etc) + voltaggio + frequenza
- [ ] UI con icone/immagini prese
- [ ] Mostra which plugs you need to buy
- [ ] Link a negozi online (opzionale)
- **Status:** ⏳ Not Started

### 3.4 Meteo
- [ ] Integrazione Open-Meteo API (no auth)
- [ ] Forecast 7-14 giorni per destinazione
- [ ] Display: temperatura, precipitazioni, vento, umidità
- [ ] Icone meteo carine (clear, rain, snow, cloud)
- [ ] Aggiornamento ogni 6 ore
- **Status:** ⏳ Not Started

### 3.5 Sezione Documenti
- [ ] Drag-and-drop file upload (PDF, foto)
- [ ] File storage su Supabase Storage (private)
- [ ] Per documento: nome, tipo (volo, hotel, assicurazione, passport, visa, vaccine), expiry date
- [ ] Metadata extraction (booking ref, hotel name, etc - opzionale)
- [ ] Lista documenti con filtri
- [ ] Download file
- [ ] Delete documento
- [ ] API endpoints
- **Status:** ⏳ Not Started

### 3.6 Chat/Note Condivise
- [ ] UI chat thread per viaggio
- [ ] Messaggi in tempo reale (o polling ogni N secondi)
- [ ] Display user avatar + nome + timestamp
- [ ] Markdown support (opzionale)
- [ ] API endpoints (save message, fetch messages)
- [ ] Notifiche @ mention (opzionale Fase 4)
- **Status:** ⏳ Not Started

### 3.7 Timeline Interattiva
- [ ] Asse temporale verticale (giorni viaggio)
- [ ] Voli, alloggi, attività posizionati cronologicamente
- [ ] Colori per categoria
- [ ] Drag-and-drop per riordinare attività (opzionale)
- [ ] Hover per dettagli
- **Status:** ⏳ Not Started

### 3.8 Testing & Bugfix
- [ ] Test API calls (REST Countries, Open-Meteo)
- [ ] Test file upload limiti e formati
- [ ] Test chat real-time
- [ ] Test timeline mobile view
- **Status:** ⏳ Not Started

**Checkpoint Fase 3:** Info paese complete, meteo, documenti gestiti, chat collaborativo, timeline interattiva.

---

## FASE 4: Notifiche + Post-Viaggio Report

**Durata stimata:** 1 settimana  
**Prerequisiti:** Fase 1, 2, 3 completate  
**Deliverable:** Sistema notifiche, report post-viaggio, archiviazione

### 4.1 Sistema Notifiche
- [ ] Email reminder 24h prima check-in volo
- [ ] Email reminder mattina checkout hotel
- [ ] Email reminder attività pianificate (es. 2h prima)
- [ ] In-app notification (badge) — includere il badge per gli inviti in sospeso, rimandato da 1.9
- [ ] Notifiche quando qualcuno invita, aggiunge info, chiede rimborso
- [ ] **Invito via canale esterno** (WhatsApp/Telegram/email) per chi non ha ancora un account — vedi nota in 1.9 "Flusso invito"; genera un link condivisibile che collega la persona all'invito in sospeso dopo la registrazione/login
- [ ] Impostazioni notifiche per utente
- **Status:** ⏳ Not Started

### 4.2 Report Post-Viaggio
- [ ] Archiviazione automatica viaggio dopo end_date
- [ ] Riepilogo viaggio:
  - Foto caricate dai partecipanti
  - Totale speso, debiti finali
  - Durata, paesi, città visitate
  - Attività completate
- [ ] Rating viaggio + note personale
- [ ] Condivisione report con partecipanti
- [ ] Esporta PDF libro viaggio (photos + spese + note)
- **Status:** ⏳ Not Started

### 4.3 Gallery Foto (Opzionale Fase 4)
- [ ] Upload foto dai partecipanti
- [ ] Gallery per data
- [ ] Geolocation embedding (opzionale)
- [ ] Condivisione pubblic link (opzionale)
- **Status:** ⏳ Not Started

### 4.4 Testing & Bugfix
- [ ] Test reminder emails
- [ ] Test report generation
- [ ] Test archiving logic
- **Status:** ⏳ Not Started

**Checkpoint Fase 4:** Sistema notifiche funzionante, report post-viaggio completi, memoria organizzata.

---

## FASE 5: Dashboard Analytics + Scratch Map

**Durata stimata:** 1-1.5 settimane  
**Prerequisiti:** Tutte le fasi precedenti completate  
**Deliverable:** Dashboard statistiche globali, mappa mondiale scratch, analytics avanzate

### 5.1 Statistiche Dashboard Globali
- [ ] Paesi visitati (contatore totale + breakdown anno)
- [ ] Città visitate (lista, contatore)
- [ ] Spesa media per viaggio
- [ ] Viaggio più caro / più economico
- [ ] Viaggio più lungo (durata giorni)
- [ ] Luogo più lontano (calcolo distanza coordinate)
- [ ] Compagni di viaggio più frequenti (ranking)
- [ ] Trending: mete revisitate
- **Status:** ⏳ Not Started

### 5.2 Grafici Analytics
- [ ] Spesa per anno (bar chart)
- [ ] Spesa per categoria (pie chart)
- [ ] Timeline viaggi (timeline view)
- [ ] Paesi per frequenza (world heatmap opzionale)
- **Status:** ⏳ Not Started

### 5.3 Scratch Map Mondiale - Dual View (3D Globe + Flat Map)

**Setup Librerie & Dati:**
- [ ] Installa Cobe (3D globe) + Leaflet + react-leaflet
- [ ] Setup GeoJSON loading (CDN Unpkg vs Supabase Storage decision)
- [ ] Scarica datasets: Natural Earth (paesi) + world-geojson (stati USA + territori)
- [ ] Setup localStorage caching per GeoJSON (offline support)
- **Status:** ⏳ Not Started

**Parte A - 3D Globe (Cobe):**
- [ ] Integrazione libreria Cobe (ultra-lightweight, 5KB)
- [ ] Rendering globo interattivo con auto-rotazione
- [ ] Scansione viaggi → estrai paesi destinazioni
- [ ] Colorazione dinamica: paesi visitati con heatmap (1=light, 5+=dark)
- [ ] Zoom/pan interactivo
- [ ] Hover paese → tooltip (nome + N visite)
- [ ] Click paese → drill-down: lista viaggio con date
- [ ] Doppio-click paese → zoom in su globo
- [ ] Dark mode support (inverted colors)
- **Status:** ⏳ Not Started

**Parte B - Flat Map (Leaflet + GeoJSON):**
- [ ] Integrazione Leaflet + react-leaflet + OpenStreetMap basemap
- [ ] Carica GeoJSON layers:
  - [ ] Level 0: Paesi mondo (Natural Earth) - 250+
  - [ ] Level 1: Suddivisioni (50 stati USA, province Canada, regioni Europa)
  - [ ] Level 2: Sotto-suddivisioni (tutti i territori USA + autonomie)
  - [ ] Level 3: De facto states & disputed territories (15+):
    - [ ] Post-Soviet: Abkhazia, South Ossetia, Transnistria, Nagorno-Karabakh
    - [ ] Middle East: Kosovo, Palestine, Northern Cyprus
    - [ ] Asia: Taiwan
    - [ ] Africa: Somaliland, Western Sahara (SADR)
    - [ ] Europa/Ucraina: Crimea, Donetsk, Luhansk
  - [ ] Aggiungi metadata riconoscimento (riconosciuto da: [lista paesi])
- [ ] Zoom dinamico: pan globo → continente → paese → regione
- [ ] Heatmap colori su tutti i livelli amministrativi
- [ ] Layer toggle buttons:
  - ☑ Paesi, ☑ Stati USA, ☑ Territori USA, ☑ Province
- [ ] Autocomplete search: "Search region" (fuzzy find su tutte le regioni)
- [ ] Dark mode: invert colori mappa (basemap dark)
- **Status:** ⏳ Not Started

**View Toggle & UX:**
- [ ] Button toggle: 3D Globe ↔ Flat Map (top-left header)
- [ ] Sincronizzazione real-time tra viste (colorazione unificata)
- [ ] Performance: render lazy solo view attiva (save CPU mobile)
- [ ] Responsive: toggle auto-hide su mobile (usa una view default)
- **Status:** ⏳ Not Started

**Interazione Utente - Globo:**
- [ ] Drag per ruotare
- [ ] Scroll/wheel per zoom
- [ ] Click paese → mostra modal "Paese: N visite, lista viaggio"
- [ ] Pulsante "Add Custom Journey Skeleton" (form veloce)
- [ ] Auto-refresh colorazione quando viaggio aggiunto
- **Status:** ⏳ Not Started

**Interazione Utente - Mappa Piatta:**
- [ ] Click regione → drill-down se livello gerarchico
- [ ] Click viaggio nella lista → enter trip detail
- [ ] Search autocomplete su tutti i nomi regioni
- [ ] Heatmap legend visibile (colori + numero visite)
- **Status:** ⏳ Not Started

**Dati & Colorazione:**
- [ ] Pre-calcola mappa visite → {regione: count} in memoria
- [ ] Genera colori dinamici basati su count (linear scale)
- [ ] Update colori quando viaggio added/modified/deleted
- [ ] Persistenza: salva visited_regions array in DB (per user)
- **Status:** ⏳ Not Started

**Export & Sharing:**
- [ ] Export PNG: entrambe le viste (globo + mappa piatta) via html2canvas
- [ ] Export CSV: lista regioni visitate (nome, tipo, visite, ultime date)
- [ ] Export GeoJSON: dati geopolitici colorati (per altre app)
- [ ] Share link pubblico: snapshot mappa (read-only, privato di default)
- [ ] QR code generazione (condividi su social)
- **Status:** ⏳ Not Started

**Statistiche Widget:**
- [ ] Display nel corner della mappa:
  - Total paesi visitati
  - Total stati USA visitati
  - Total territori visitati
  - Regione più visitata
  - Ultimo viaggio aggiunto
- [ ] Live update quando viaggio changed
- **Status:** ⏳ Not Started

**Testing & Performance:**
- [ ] Test caricamento GeoJSON (timing, size)
- [ ] Test heatmap rendering con 100+ regioni colorate
- [ ] Test mobile responsivo (zoom, pan, toggle view)
- [ ] Test sincronizzazione globo ↔ mappa (stessi colori)
- [ ] Test export PNG quality (entrambe viste)
- [ ] Performance optimization: lazy-render, memoization
- **Status:** ⏳ Not Started

**Checkpoint Fase 5.3:** Dual-map funzionante, auto-population dai viaggi, export funzionante, stats visibili.

### 5.4 Export & Sharing Statistiche
- [ ] Esporta statistiche annuali come report PDF
- [ ] Share link pubblico profilo viaggiatore (opzionale)
- **Status:** ⏳ Not Started

### 5.5 Filtering & Drill-Down
- [ ] Filter statistiche per anno
- [ ] Drill-down: click statistica → lista viaggi associati
- **Status:** ⏳ Not Started

### 5.6 Testing & Bugfix
- [ ] Test performance con N viaggi (100, 1000)
- [ ] Test calcoli distanze edge cases
- [ ] Test rendering mappa grandi dataset
- **Status:** ⏳ Not Started

### 5.7 Polish & UI Refinement
- [ ] Design statistiche coerente e intuitivo
- [ ] Dark mode completo
- [ ] Mobile responsive tutte le viste
- **Status:** ⏳ Not Started

**Checkpoint Fase 5:** Dashboard analytics completo, mappa scratch funzionante, stats globali visibili.

---

## FASE 6: Admin Dashboard — Metriche Servizio

**Durata stimata:** 0.5 settimane  
**Prerequisiti:** Fase 1 completata (auth + profili)  
**Deliverable:** Pannello web privato per admin — metriche aggregate anonime + stima consumi Supabase free tier

> ⚠️ **Privacy by design**: nessun dato personale esposto, nessun viaggio, nessun contenuto utente.
> Tutte le query restituiscono solo contatori aggregati.

### 6.1 Ruolo Admin

#### Schema DB
- [ ] Migration `0012_admin_role.sql`: aggiungere colonna `is_admin boolean not null default false` a `public.profiles` (numerazione aggiornata, vedi nota in 1.9)
  - Solo un superuser Postgres o il proprietario del progetto Supabase può settare `is_admin = true` via SQL diretto (mai via UI pubblica)
  - Index `idx_profiles_is_admin` (sparse, pochissime righe `true`)
- [ ] RLS: nessuna policy espone `is_admin` agli utenti normali; le funzioni admin usano `security definer`
- **Status:** ⏳ Not Started

#### Protezione route
- [ ] Hook React `useAdminGuard`: legge `profile.is_admin` dall’AuthContext; se `false` o `null` → redirect a `/` con toast "accesso negato"
- [ ] Route `/admin` protetta da `AdminRoute` component (simile a `ProtectedRoute` già presente)
- [ ] Nessun link visibile nell’UI per utenti non-admin (la route esiste ma non è navigabile)
- **Status:** ⏳ Not Started

### 6.2 Metriche Aggregate (anonime)

Tutte le query sono funzioni Postgres `security definer` richiamabili solo da admin.

#### Utenti
- [ ] **Totale utenti registrati** — `count(*) from auth.users`
- [ ] **Nuovi utenti ultimi 30 giorni** — `count(*) where created_at >= now()-interval '30 days'`
- [ ] **Utenti attivi ultimi 7 / 30 giorni** — da `auth.users.last_sign_in_at` (già in Supabase Auth, nessun dato aggiuntivo)
- [ ] **Tasso di ritorno** — utenti con `last_sign_in_at` > `created_at + 1 day` / totale (anonimo)
- **Status:** ⏳ Not Started

#### Contenuti (solo aggregati)
- [ ] Totale viaggi creati
- [ ] Totale attività / alloggi / mezzi / checklist items
- [ ] Media elementi per viaggio (aggregato globale, non per utente)
- [ ] Totale partecipanti shared (quante volte un viaggio è stato condiviso)
- **Status:** ⏳ Not Started

### 6.3 Stima Consumi Supabase Free Tier

I limiti del **Free Tier Supabase (2024)** da monitorare:

| Risorsa | Limite Free | Come stimarlo |
|---|---|---|
| Database size | 500 MB | `pg_database_size('postgres')` via RPC |
| Monthly Active Users | 50.000 | `count(distinct user_id from auth.users where last_sign_in >= now()-30d)` |
| Storage (immagini) | 1 GB | `sum(metadata->>'size')` da `storage.objects` |
| Bandwidth | 5 GB/mese | Non misurabile lato DB; stima: N immagini × 400 KB |
| Edge Functions invocations | 500.000/mese | (futuro) |

- [ ] Funzione RPC `admin_get_db_size()` — `security definer`, ritorna `pg_database_size` in MB
- [ ] Funzione RPC `admin_get_storage_used()` — somma `size` da `storage.objects` dove bucket = 'trip-covers'
- [ ] Stima bandwidth: `(numero immagini × 400 KB) + (numero utenti attivi × 50 KB per sessione media)` calcolata lato frontend con le metriche sopra
- [ ] Barre di progresso visive per ogni risorsa (es. `243 MB / 500 MB = 48%`)
- [ ] Soglie colorate: verde < 60%, giallo 60-85%, rosso > 85%
- [ ] Nota disclaimer: "Stime approssimative. Verificare sul pannello Supabase per dati esatti."
- **Status:** ⏳ Not Started

### 6.4 UI Admin Dashboard

- [ ] Layout dedicato `/admin` — sidebar minimal, header con badge "ADMIN"
- [ ] Sezione **Utenti**: KPI cards (totale, nuovi 30gg, attivi 7gg, attivi 30gg)
- [ ] Sezione **Contenuti**: contatori aggregati in tabella o card grid
- [ ] Sezione **Consumi Supabase**: barre progresso per ogni risorsa monitorata
- [ ] Refresh manuale (button) + timestamp "ultimo aggiornamento"
- [ ] Export CSV dei dati aggregati (per storico manuale)
- [ ] Nessun campo utente esposto: niente email, username, niente lista viaggi
- **Status:** ⏳ Not Started

### 6.5 Sicurezza & Audit
- [ ] Tutte le funzioni admin usano `security definer` + check esplicito `auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)` — doppia protezione
- [ ] Log degli accessi admin in tabella `admin_access_log` (timestamp, admin_uid, action) — niente PII
- [ ] Review semestrale: verificare che nessuna query esponga dati utente individuali
- **Status:** ⏳ Not Started

**Checkpoint Fase 6:** Admin può accedere a `/admin`, vedere metriche aggregate anonime e stimare i consumi Supabase senza mai toccare dati personali degli utenti.

---

## Post-Launch (Opzionale)

- [ ] Mobile app native (React Native)
- [ ] Offline sync (service worker)
- [ ] AI travel suggestions
- [ ] Integration con booking.com, airbnb, skyscanner (affiliate links - monetizzazione)
- [ ] Social sharing stats
- [ ] Backup/export dati
- [ ] API pubblica per altri developer

---

## Timeline Totale Stimata

| Fase | Settimane | Cumulative | Status |
|------|-----------|-----------|--------|
| 1 | 1.5 | 1.5 | ⏳ |
| 2 | 1.25 | 2.75 | ⏳ |
| 3 | 1.75 | 4.5 | ⏳ |
| 4 | 1 | 5.5 | ⏳ |
| 5 | 1.25 | 6.75 | ⏳ |
| 6 | 0.5 | 7.25 | ⏳ |

**Totale: ~7 settimane** (caso ottimista, parallelizzando dove possibile)

---

## Note

- Ogni fase è indipendente e testata prima di merge in main
- Deploy staging dopo ogni fase
- User testing durante/dopo Fase 1 su team interno
- Iterazione veloce: feedback loop settimanale
- Priorità: MVP (Fase 1-2) funzionante presto, Fase 3-5 polish

---

## Contatti Check-In

- Weekly sync: review blockers, adjust timeline
- Milestone review: end of each phase
- Go/no-go decision per launch: fine Fase 2

---

*Documento living - aggiornare man mano che progredisci nei task.*
