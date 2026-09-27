# Travel App - Roadmap Fasi

## Stato Progetto

| Fase | Nome | Status | Completamento |
|------|------|--------|----------------|
| 1 | MVP Core (Auth + Viaggio Base) | 🟡 In Progress | 95% |
| 2 | Packing + Expense Split | ⏳ Not Started | 0% |
| 3 | Info Paese + Documenti + Chat | ⏳ Not Started | 0% |
| 4 | Timeline + Notifiche + Post-Report | ⏳ Not Started | 0% |
| 5 | Dashboard Analytics + Scratch Map | ⏳ Not Started | 0% |
| 6 | Admin Dashboard (metriche servizio) | ⏳ Not Started | 0% |

**Ultimo aggiornamento:** 2026-09-27  
**Prossima milestone:** Fase 1 — Storage & Compressione Immagini copertina (1.12b) e deployment/PWA. (Vista calendario giorno/settimana con drag&drop, icone attività e copertina Unsplash integrate da `main`; test 1.10 completati; import Notion e responsivo mobile spostati a fine progetto).

---

## FASE 1: MVP Core - Auth + Viaggio Base

**Durata stimata:** 1-2 settimane  
**Deliverable:** Web app funzionante con viaggio basic, inviti, attività/alloggi/voli

### 1.1 Setup Infrastruttura
- [x] Creare progetto ASP.NET Core (Minimal APIs)
- [x] Setup React TypeScript + Tailwind + shadcn
- [x] Supabase project setup (database, auth, storage) — migrazioni `0001`→`0010` applicate nel SQL Editor
- [x] Environment variables e secrets management (`frontend/.env.local` + `.env.example`)
- [~] PWA setup: manifest.json fatto, service worker e icone mancanti (icone rimandate, vedi 1.4)
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
- [x] Scrivere traduzioni base (common, nav, dashboard, trip sections) — verificato: 256 chiavi in EN e IT, nessuna mancante da una parte o dall'altra; nessuna stringa hardcoded trovata nelle sezioni più recenti (Amici/Viaggiatori)
- [x] Setup i18n config nel progetto React
- [x] Language selector nel header/settings
- [x] Test switch language (reload UI)
- [x] Assicurare localStorage persistence lingua
- **Status:** 🟢 Done

### 1.2 Autenticazione
- [x] Supabase Auth integration (email/password) — testata, funzionante
- [x] Login form UI — redisegnata senza riquadro Card, campi liberi sullo sfondo
- [x] Signup form UI — idem, più campo username obbligatorio (vedi 1.9)
- [x] Cambio password (modale Profilo, `supabase.auth.updateUser`)
- [x] Logout + session management
- [x] Protected routes (redirect if not authenticated)
- [x] User profile API endpoint (`fetchProfile`/`updateProfile` in `lib/api.ts`)
- **Status:** 🟢 Done
- **Nota:** OAuth Google/Apple spostato in Fase 6 (vedi 6.6)

### 1.3 Database & Migrations
- [x] Creare tabelle: trips, trip_participants, activities, flights, accommodations, profiles — `0001_init.sql` applicata
- [x] Row-level security policies — audit completo di tutte le 17 migration: ogni tabella con dati utente (`trips`, `trip_participants`, `activities`, `flights`, `accommodations`, `checklist_items`, `checklist_categories`, `profiles`, `friendships`, `profile_views`) ha RLS abilitata con policy esplicite. Non è emerso nessun altro buco simile a quello risolto su `profiles` in `0010_profiles_rls.sql`
- [x] Indexes su foreign keys
- [x] Triggers per updated_at auto
- **Status:** 🟢 Done

### 1.4 Responsive Mobile & PWA UI

> Rimandato: continuiamo a predisporre le basi (layout responsive, touch target) man mano che si costruisce, ma la revisione/test dedicata (icone, "Add to Home Screen", device reali) si fa in blocco a fine progetto, non ora.

- [~] Verificare layout mobile-first (mobile 0-640px) — header/sidebar/forms responsive, test su device pendente
- [~] Test touch-friendly buttons (min 44x44px) — rispettato nei componenti
- [ ] "Add to Home Screen" prompt (custom UI o WebKit)
- [ ] Icone manifest.json e splash screen
- [ ] Test su iPhone real device (o simulator)
- [ ] Test dark/light mode toggle on mobile
- [ ] Language selector accessibility on mobile
- **Status:** ⏳ Rimandato a fine progetto

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
  - [x] Integrazione Unsplash API (suggerimento immagine di copertina, alternativa all'upload manuale) — pulsante "Suggerisci da Unsplash" in `TripForm.tsx`, cerca per destinazione (default: prima meta del viaggio, modificabile), griglia di 6 risultati; alla scelta si salva direttamente l'URL Unsplash (`cover_image_url`), nessun upload/storage; attribuzione fotografo visibile e cliccabile (link a Unsplash con `utm_source`), trigger di download tracciato come richiesto dalle Unsplash API Guidelines (`frontend/src/lib/unsplash.ts`)
  - [x] Salva a DB
- [x] Card styling: deep blue border, gold accents
- [x] Redirect a viaggio dopo creazione
- **Status:** 🟢 Done
- **Nota:** per attivare il pulsante Unsplash serve una Access Key gratuita da https://unsplash.com/developers (app "Demo", 50 richieste/ora) da incollare in `VITE_UNSPLASH_ACCESS_KEY` su `.env.local` — senza la chiave il pulsante resta nascosto, nessun errore

### 1.5b Dettaglio Viaggio - Layout Base

> Nota: questa sezione era numerata "1.5" per errore, duplicando 1.5 Dashboard qui sopra — rinominata in 1.5b, nessun contenuto cambiato.

- [ ] Sidebar con 9 sezioni (Attività, Alloggi, Voli, Packing, Expense, Info, Documenti, Chat, Report) — rimandato, per ora la tab bar assolve la stessa funzione
- [x] Header con nome viaggio, date, partecipanti
- [x] Tab navigation (Attività/Alloggi/Voli/Check List attive, altre sezioni disabilitate "coming soon")
- [x] Modifica viaggio dal dettaglio (nome, date, mete, budget) — modal `TripForm` in modalità edit, `updateTrip` API
- [x] Bandiere dei paesi delle mete nel header del viaggio (una per paese, deduplicate; codice paese salvato in `countryCode` e risolto via Nominatim per i viaggi esistenti, con cache localStorage)
- **Status:** 🟡 In Progress (resta solo la sidebar, rimandata)

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
- [x] **v2 (migrazione `0018` + `0019`):** tipo limitato a hotel/apartment, città con
      autocomplete Nominatim (mete del viaggio prima, poi mondo intero) e coordinate
      salvate, piattaforma di prenotazione con loghi, link prenotazione normalizzato,
      contatti telefono/email, 20 optional salvati per chiave, foto con crop quadrato
      800px / JPEG ≤400 KB
- [x] Foto alloggio: compressione alla selezione con anteprima del risultato reale,
      upload in due fasi in creazione (serve l'id per il path), path deterministico
      `<userId>/<accId>.jpg` con `photo_path` nel DB → nessun file orfano, rimozione
      foto e cancellazione alloggio eliminano davvero l'oggetto dallo storage
- [x] **Stelle hotel (migrazione `0020`):** `stars smallint NULL` con CHECK 1-5,
      selettore 1-5 stelle nel form mostrato solo per `type = 'hotel'`, visualizzato
      in card come sola lettura. Su appartamento non viene salvato
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

> 🔭 **Evoluzione futura pianificata** (parzialmente implementata in 1.9b, vedi sotto):
> - **Invito anche a chi non ha un account**: oltre alla ricerca per username (quella attuale, per chi è già registrato), aggiungere un invito "esterno" via link condivisibile su WhatsApp/Telegram/email — la persona invitata si registra (o si logga) e il link la collega automaticamente all'invito in sospeso.
> - **Sistema Amici** (👉 sezione **1.9b** qui sotto): completato con richiesta/accetta/rifiuta amicizia, profili viaggiatori pubblici e invito al viaggio limitato agli amici in `ShareTripModal`. Notifiche rimandate a Fase 4.

### 1.9b Viaggiatori, Profili Pubblici & Amici

- [x] Migration `0012_social.sql`: tabella `friendships` (requester/addressee + status pending/accepted/declined + RLS), colonna `is_public` su `trips`, tabella `country_continents` (ISO α2 → continente), RPC `set_trip_public`
- [x] Pagina **Viaggiatori** (`/travelers`, icona `Users` nella sidebar sopra Impostazioni): barra di ricerca per username (debounce 300ms, RPC `search_travelers`) con stato amicizia (amici/richiesta inviata/richiesta ricevuta)
- [x] Pagina **Profilo Viaggiatore** (`/travelers/:userId`): avatar, @username, data iscrizione; statistiche pubbliche **paesi e continenti visitati** (`get_traveler_profile`, calcolate su tutti i viaggi, deduplicated da `destinations.countryCode`); viaggi **pubblici** dell'utente (`get_public_trips_for_user`)
- [x] Richiesta di amicizia: RPC `send_friend_request` / `respond_to_friend_request`; pulsanti Aggiungi amico / Richiesta inviata / Accetta / Rifiuta in base allo stato
- [x] Toggle **Rendi pubblico/privato** su un viaggio (icona globo nel dettaglio, solo owner, RPC `set_trip_public`)
- [x] `ShareTripModal` invita solo amici (riusa `get_friends` + `fetch_trip_participants`, filtrati lato client — niente più ricerca globale): elenco unico con chi è già nel viaggio in cima e gli amici ancora invitabili sotto, con pulsante Invita
- [x] Avatar dei partecipanti (esclude te stesso) accanto alle date nel dettaglio viaggio, con hover desktop che mostra lo username
- [x] **Lista Amici** — dentro `/travelers` (`TravelersPage.tsx`), sezione "I miei amici" con richieste in entrata/uscita, accetta/rifiuta e badge (migration `0015_friend_lists.sql`: `get_friends`, `get_incoming_friend_requests`, `count_incoming_friend_requests`) — non serve una pagina separata
- **Status:** 🟢 Done

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
- [x] Test login/logout — confermato funzionante
- [x] Test inviti — confermato funzionante
- [x] Test CRUD attività/alloggi/voli — script `supabase/test_rls_crud.mjs`, eseguito con gli account di test (`lucia_explorer`/`marco_wanderer` da `seed_test_accounts.mjs`): crea/legge/modifica su activities, accommodations, flights come owner — 21/21 verifiche OK
- [x] Test autorizzazioni (row-level security) — stesso script: un estraneo non invitato non vede/scrive nulla; un viewer legge ma non può creare/modificare/eliminare; promosso a editor ottiene CRUD pieno; flusso invito (pending → `respond_to_invite`) testato nello stesso passaggio. Nessuna regressione trovata
- [x] `npm run build` e `npm run lint` puliti (nessun errore di tipo, nessun warning)
- [ ] Test responsivo mobile — rimandato insieme a 1.4
- [ ] Bugfix eventuali
- **Status:** 🟢 Done (resta solo il responsivo mobile, rimandato)

### 1.11 Import da Notion (MVP)

> **Rimandato a ridosso del lancio.** L'export Notion contiene anche checklist e spese, non solo i dati base del viaggio (nome/date/mete) — un import fatto ora dovrebbe comunque essere rifatto quando la sezione Spese (Fase 2) e le altre sezioni saranno complete, per mappare tutto in un solo passaggio invece di due. Non blocca la chiusura del resto della Fase 1.

- [ ] Pagina "/import" con drag-and-drop upload
- [ ] Parser CSV/JSON da Notion export
- [ ] Mapping automatico colonne (name, dates, destinations, budget, checklist, spese)
- [ ] Preview import prima di salvare
- [ ] Batch save viaggi a DB
- [ ] Fallback: form manuale "Add Journey Skeleton" (nome + destinazioni + date)
- [ ] Notifica success/error
- [ ] Test con Notion export reale
- **Status:** ⏳ Rimandato (a fine progetto, dopo Fase 2/3)

### 1.12a API esterne & privacy (prerequisito al deploy)

> Nota di contesto: riguarda solo la ricerca città/paesi nel form crea-viaggio (autocomplete mete), che usa Nominatim (OpenStreetMap) gratuitamente senza chiave API — nessuna azione richiesta ora, solo un promemoria per quando il traffico crescerà.

- [x] Ricerca mete via Nominatim/OSM — nessuna chiave API, nessun segreto nel bundle JS
- [x] Bandiere via CDN immagini REST Countries (gratis) — nessuna chiave
- [ ] Verificare Nominatim Usage Policy (≤ 1 req/s, header identificativo) e usarlo così solo per dev/testing; se il traffico cresce dopo il lancio, mettere un proxy/cache (Edge Function) davanti alle chiamate
- **Status:** 🟡 In Progress (nessuna chiave da proteggere; il proxy si valuta solo se il traffico reale lo richiede, non prima)

### 1.12b Storage & Compressione Immagini

> **Obiettivo:** contenere il consumo di Supabase Storage (limite free: 1 GB) facendo in modo che ogni immagine caricata pesi poco, indipendentemente dal file originale caricato dall'utente.
> **Già implementato**, con parametri leggermente diversi dalla spec originale ma che raggiungono lo stesso obiettivo — vedi sotto.

#### Strategia: compressione client-side prima dell'upload — ✅ fatto
- [x] Utility `compressImage(file: File, maxKB = 500): Promise<Blob>` in `frontend/src/lib/image.ts`: resize via Canvas API a max 1280px sul lato lungo, poi `canvas.toBlob('image/jpeg', quality)` in loop scendendo di qualità finché il peso è ≤ `maxKB`
- [x] Usata sia per la cover del viaggio (`TripForm.tsx`, upload su bucket `trip-covers`) sia per l'avatar profilo (`EditProfileModal.tsx`, bucket `avatars`)
- [x] Tutto lato browser, nessun post-processing server-side necessario
- **Differenze rispetto alla spec originale** (JPEG invece di WebP, 1280px lato lungo invece di 960×540 fisso, 500 KB invece di 200 KB): comunque ampiamente sufficiente — 500 KB × ~2.000 immagini = 1 GB, margine ancora ampio per l'uso attuale del team
- **Status:** 🟢 Done

#### Guardia lato Supabase Storage (difesa in profondità) — ✅ presente
- [x] Bucket `trip-covers`: `file_size_limit = 5242880` (5 MB) impostato in `0006_storage_trip_covers.sql` — guard server-side se la compressione client non girasse
- [x] RLS bucket: solo l'utente autenticato può caricare/modificare/eliminare nel proprio path (`{user_id}/...`), sia su `trip-covers` che su `avatars`
- **Nota minore non bloccante:** il naming file cover è `{user_id}/{trip_id}-{timestamp}.jpg` (non un path fisso sovrascrivibile) — ogni nuova cover carica un file nuovo senza eliminare il precedente, quindi nel tempo si accumulano immagini orfane. Da valutare in futuro un cleanup (delete della vecchia cover all'upload della nuova), non urgente vista la marginalità del volume
- **Status:** 🟢 Done

#### Impatto stimato sullo storage (con target reale ≤500 KB/immagine)
| Scenario | Immagini | Peso medio | Totale |
|---|---|---|---|
| 100 utenti × 5 viaggi | 500 | 300 KB | **~150 MB** |
| 1.000 utenti × 5 viaggi | 5.000 | 300 KB | **~1.5 GB** ⚠️ |
| Soglia attenzione (75%) | — | — | 750 MB / 1 GB |

Con l'uso attuale del team (poche decine di viaggi) siamo ben sotto soglia; se l'app crescesse a migliaia di utenti conviene rivedere il target verso il basso (es. tornare a WebP/200 KB) o attivare il cleanup delle cover orfane citato sopra.



### 1.12 Deployment
- [ ] Deploy backend (es. Azure, Heroku)
- [ ] Deploy frontend (es. Vercel)
- [ ] Setup custom domain (opzionale)
- **Status:** ⏳ Not Started
- **Nota:** non è più necessario aggiungere alcun dominio/whitelist su REST Countries: l'autocomplete usa Nominatim/OSM senza chiave

**Checkpoint Fase 1:** Utente può creare un viaggio, invitare partecipanti, aggiungere attività/alloggi/voli, collaborazione in tempo reale. (Import da Notion rimandato a fine progetto, vedi 1.11)

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

### 3.1b Link Sicurezza — Viaggiare Sicuri (Farnesina)
- [ ] Pulsante per ogni paese di destinazione del viaggio che rimanda alla scheda paese ufficiale di viaggiaresicuri.it (Ministero Affari Esteri)
  - URL pattern verificato: `https://www.viaggiaresicuri.it/find-country/country/{ISO3}` (es. Thailandia → `THA`) — serve solo il codice ISO 3166-1 alpha-3 del paese
  - Il viaggio salva già `countryCode` alpha-2 (vedi 1.5); serve conversione alpha-2 → alpha-3 (tabella statica, oppure campo `cca3` di REST Countries, stessa API già usata altrove nel progetto)
- [ ] Se il viaggio ha più mete/paesi, un pulsante per ciascun paese (non uno generico): bandierina del paese + piccolo badge/logo "Farnesina - Viaggiare Sicuri" per riconoscerlo a colpo d'occhio
- [ ] Apertura in nuova scheda (`target="_blank" rel="noopener noreferrer"`)
- [ ] Posizionamento: in cima al tab "Info" del dettaglio viaggio, una riga di pulsanti (uno per paese)
- **Status:** ⏳ Not Started

### 3.1c Frasario Utile (Traduzioni Lingua Locale)

> **Obiettivo:** aiutare a comunicare con la gente del posto senza parlare la lingua, mostrando lo schermo del telefono.

- [ ] Determinare la/le lingua/e ufficiali del paese di destinazione (campo `languages` di REST Countries, già integrato; se il paese ha più lingue ufficiali, permettere scelta/priorità)
- [ ] Dataset frasario per lingua, struttura per voce: `{categoria, frase_it, frase_locale (script originale), pronuncia_it (trascrizione fonetica leggibile in italiano — utile per lingue non latine come cinese, giapponese, coreano, arabo, thailandese...), icona_categoria}`
- [ ] Categorie iniziali:
  - Allergie e intolleranze ("Sono allergico/a a...", "Non posso mangiare glutine/lattosio/frutta secca", "Contiene [ingrediente]?")
  - Bisogni base ("Dove è il bagno?", "Ho bisogno di aiuto", "Dove è la farmacia/l'ospedale?")
  - Emergenze ("Chiamate la polizia/un'ambulanza", "Ho perso il passaporto")
  - Orientamento e trasporti ("Dove è la stazione/fermata?", "Quanto costa?", "Mi aiuta ad arrivare a...?")
  - Cortesia base (grazie, per favore, scusi, sì/no, "non parlo [lingua]/non capisco")
- [ ] UI: lista frasi raggruppate per categoria con ricerca/filtro
- [ ] Tap su una frase → vista "schermo grande" pensata per essere mostrata a una persona del posto: frase in lingua locale (script originale, font enorme), pronuncia italiana sotto (più piccola), sfondo ad alto contrasto
- [ ] Disegno stilizzato per ogni categoria (set di icone SVG semplici e riutilizzabili, es. WC per i bagni, triangolo di allerta per allergie) mostrato nella vista "schermo grande" insieme al testo
- [ ] Scope MVP: coprire un set iniziale di lingue delle destinazioni più comuni (inglese, francese, spagnolo, tedesco, giapponese, cinese mandarino, coreano, thailandese, arabo, greco, portoghese), dataset curato manualmente ed espandibile in seguito
- [ ] Dati statici in JSON (es. `/public/locales/phrasebook/{lang}.json`) — valutare in alternativa una tabella Supabase se si vuole poter aggiungere lingue/frasi senza redeploy
- [ ] Fallback se la lingua del paese non è ancora coperta dal dataset: messaggio + link a Google Translate
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

### 6.6 OAuth Google & Apple

> Spostato da Fase 1 (1.2): login email/password copre già l'uso quotidiano del team, l'OAuth è un miglioramento UX rimandabile a fine roadmap.

- [ ] OAuth Google setup (Supabase Auth provider + Google Cloud OAuth client)
- [ ] OAuth Apple setup (Supabase Auth provider + Apple Developer Sign in with Apple)
- [ ] Pulsanti "Continua con Google/Apple" in Login/Signup UI
- [ ] Collegamento account: se l'email OAuth coincide con un account esistente, merge invece di duplicare
- [ ] Test flusso completo su mobile (redirect/deep link)
- **Status:** ⏳ Not Started

**Checkpoint Fase 6:** Admin può accedere a `/admin`, vedere metriche aggregate anonime e stimare i consumi Supabase senza mai toccare dati personali degli utenti. Login disponibile anche via Google/Apple.

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
