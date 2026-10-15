# Travel App - Roadmap Fasi

## Stato Progetto

| Fase | Nome | Status | Completamento |
|------|------|--------|----------------|
| 1 | MVP Core (Auth + Viaggio Base) | 🟡 In Progress | 90% (resta il blocco "lancio": PWA, mobile, deploy, import Notion) |
| 2 | Check List + Spese condivise | 🟡 In Progress | 80% |
| 3 | Info Paese + Calendario + Chat | 🟡 In Progress | 70% (Documenti rimosso dallo scope) |
| 4 | Notifiche + Post-Report | 🟡 In Progress | 10% |
| 5 | Atlante personale + Statistiche | 🟡 In Progress | 50% (atlante ~85%, statistiche globali ~15%) |
| 6 | Admin Dashboard + OAuth | ⏳ Not Started | 0% |

**Ultimo aggiornamento:** 2026-10-15 (stato verificato sul codice: 57 commit, migration fino a `0043`, `npm run build` pulito)  
**Prossima milestone:** completare il nucleo funzionale mancante — export PDF spese (2.5), chat del viaggio (3.6), campanella notifiche/inviti (4.1), statistiche globali (5.1/5.2) — poi il blocco "lancio": PWA + test mobile (1.4), deploy (1.12), import Notion (1.11).

> **Migration da applicare a mano:** tutte le migration `0001`→`0043` vanno eseguite nel Supabase SQL Editor. Prima del deploy verificare che il progetto Supabase di produzione le abbia tutte.

> **Nota architetturale:** il frontend parla **solo con Supabase** (query dirette protette da RLS + RPC `security definer`). Il backend ASP.NET (`backend/JourneyAtlas.Api`) è rimasto uno scheletro (~100 righe) e non è usato da nessuna funzione. Da decidere: rimuoverlo dalla roadmap/deploy, oppure riusarlo solo come proxy/cache (es. Nominatim, 1.12a).

---

## FASE 1: MVP Core - Auth + Viaggio Base

**Durata stimata:** 1-2 settimane  
**Deliverable:** Web app funzionante con viaggio basic, inviti, attività/alloggi/voli

### 1.1 Setup Infrastruttura
- [x] Creare progetto ASP.NET Core (Minimal APIs) — creato ma inutilizzato, vedi nota architetturale in cima
- [x] Setup React TypeScript + Tailwind + shadcn
- [x] Supabase project setup (database, auth, storage) — migrazioni `0001`→`0043`
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
- [x] Fix successivi: `0034_restrict_participant_self_insert.sql` chiude un buco per cui un utente poteva auto-inserirsi come editor in un viaggio altrui (l'auto-insert ora è ammesso solo come owner del viaggio appena creato); `0042_reference_tables_read.sql` aggiunge la policy di lettura mancante su `country_continents` (l'atlante mostrava "Continenti 0/7"). Le nuove tabelle (`expenses`, `expense_splits`, `expense_categories`, `trip_notifications`, `atlas_marks`) nascono con RLS
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

- [~] ~~Sidebar con 9 sezioni~~ — sostituita definitivamente dalla tab bar (pill animate, sticky): non più prevista
- [x] Header con nome viaggio, date, partecipanti
- [x] Tab navigation — 7 tab attive: **Calendario** (default), Attività, Alloggi, Spostamenti, Check List, Spese, Info Paese. Documenti rimosso (vedi 3.5), Chat/Report non ancora presenti
- [x] Modifica viaggio dal dettaglio (nome, date, mete, budget) — modal `TripForm` in modalità edit, `updateTrip` API
- [x] Bandiere dei paesi delle mete nel header del viaggio (una per paese, deduplicate; codice paese salvato in `countryCode` e risolto via Nominatim per i viaggi esistenti, con cache localStorage)
- [x] Colore della testata adattivo alla luminosità della cover (`useImageBrightness`); mete riordinabili e duplicabili nel form (`ItineraryEditor`)
- [x] Eliminazione viaggio con conferma (`DeleteTripButton`, migration `0039_delete_trip.sql` — FK spese differite per permettere il cascade); i partecipanti ricevono un avviso `trip_deleted`
- [x] Modalità **sola lettura** per i viewer su tutte le tab
- **Status:** 🟢 Done

### 1.6 Sezione Attività
- [x] Form aggiungi attività (nome, descrizione, data, orario, luogo, categoria, status)
- [x] Lista attività con filtri (per status, per categoria)
- [x] Edit/delete attività
- [x] API endpoints (CRUD - supabase direct, senza backend esterno per ora)
- [x] Icone per categoria e durata attività (`0018`, `0019`), operatore di prenotazione con logo personalizzato (`0028`, es. GetYourGuide)
- [x] Grafico distribuzione attività per categoria (`ActivityCategoryChart`)
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
- [x] Numero camere e bagni (`0023`, `0029`), logo piattaforma di prenotazione (`0030`)
- [x] Card con numero di notti, ordine cronologico, indirizzo cliccabile (apre la mappa)
- **Status:** ✅ Done

### 1.8 Sezione Spostamenti (ex Voli, ex Mezzi)
- [x] Tab rinominata da "Voli" a "Mezzi" e poi a "Spostamenti" (i18n IT/EN)
- [x] Migration `0005_transport_type.sql` (colonna `transport_type` con valori flight/train/bus/ferry/car/other)
- [x] Selettore tipo di mezzo nel form (aereo, treno, pullman, traghetto, auto, altro) con icone
- [x] Etichette dinamiche: aeroporti per voli, stazione/città per gli altri mezzi
- [x] Badge tipo mezzo nelle card
- [x] Form aggiungi mezzo (aeroporti, date/orari, compagnia, numero, booking ref)
- [x] Lista mezzi
- [x] Edit/delete
- [x] API endpoints
- [x] **Voli:** ricerca aeroporti (dataset locale ~4.600 righe + alias) e compagnie aeree con logo; terminal e bagagli extra (`0025`); niente vincolo sulle date del viaggio
- [x] **Treni e traghetti:** picker stazioni, porti, operatori ferroviari e marittimi; opzioni posto/cabina (`0026`)
- [x] Card stile **carta d'imbarco** con logo e colore della compagnia (`TransportCard`), gradiente fisso per i bus
- [x] Toggle fuso orario: ora locale vs ora della città di casa (`home_city` nel profilo, `0024`)
- **Status:** ✅ Done

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
- [x] Icona personalizzabile per categoria (migration `0004` tabella `checklist_categories`, set Lucide), icon picker responsive
- [x] Filtri sticky "glass" e categorie raggruppate; seed di voci realistiche per i viaggi esistenti (`0027`, solo dati di prova)
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
- [x] Profilo pubblico: compaiono anche i viaggi pubblici a cui l'utente partecipa (`0036`) con indicazione "ci sei anche tu" (`0037`); viaggiatori popolari (`0013`) e visite al profilo (`0014`)
- [x] Nazionalità nel profilo (`0031`) — usata in Info Paese per escludere il proprio paese
- [x] Conteggi paesi/continenti del profilo allineati all'atlante (`0041`: contano anche i viaggi a cui si partecipa e i segni manuali)
- **Status:** 🟢 Done

### 1.9c Compagni di viaggio senza account
- [x] Migration `0032_trip_companions.sql`: partecipanti "compagno" (solo nome) in `trip_participants`, senza account — possono pagare/partecipare alle spese; se poi si registrano e collegano l'account, la riga (e le spese) restano le loro
- [x] `CompanionsSection` nel form viaggio e `useCompanions`
- [x] Rimozione viaggiatore con conferma (`RemoveTravelerModal`), bloccata se compare in una spesa (FK `NO ACTION`); il rimosso riceve un avviso in-app (`0035`, vedi 4.1)
- [x] Link al profilo dai partecipanti; date del viaggio nella card invito (`0033`)
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
- [x] `npm run build` pulito (verificato 15/10)
- [x] `npm run lint` di nuovo pulito (15/10): rimossi un parametro inutilizzato in `airlineColors.ts`, un export superfluo in `TimeField.tsx` e aggiunta la dipendenza `trip.destinations` mancante in `CalendarSection.tsx`
- [ ] Test RLS da estendere alle tabelle nuove (`expenses`, `expense_splits`, `atlas_marks`, `trip_notifications`) e ai compagni senza account — `test_rls_crud.mjs` copre solo activities/accommodations/flights
- [x] Code-splitting (15/10): pagine caricate on demand (`React.lazy` in `App.tsx`, `Suspense` attorno all'`Outlet` di `AppLayout`) e librerie in chunk separati (`manualChunks` in `vite.config.ts`: react, supabase, framer-motion, i18n, d3-geo). Bundle iniziale dell'app da 1,32 MB a 84 KB, warning Vite sparito; il chunk più grande è il dataset aeroporti (405 KB, già caricato a parte)
- [ ] Test responsivo mobile — rimandato insieme a 1.4
- [ ] Bugfix eventuali
- **Status:** 🟡 In Progress (test RLS nuove tabelle, responsivo mobile)

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
- [x] ~~Fallback: form manuale "Add Journey Skeleton"~~ → realizzato come **viaggio ricordo** (vedi 1.13)
- **Status:** ⏳ Rimandato (a fine progetto, dopo Fase 2/3)

### 1.13 Viaggi rapidi / "ricordo"
- [x] Migration `0043_memory_trips.sql`: `is_memory`, `stopovers` (aeroporti di scalo), `date_precision` (`day` / `month`)
- [x] `MemoryTripForm` dalla dashboard: viaggio passato registrato in fretta — paesi (città facoltative), scali, date anche solo mese/anno, compagni
- [x] Il viaggio ricordo conta nell'atlante e nelle statistiche del profilo, ma non apre il gestionale (si modifica solo con il suo form); form crea-viaggio e form ricordo unificati nello stile
- **Status:** 🟢 Done

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

**Checkpoint Fase 1:** ✅ Funzionalmente raggiunto: l'utente crea viaggi (anche "ricordo"), invita amici e compagni senza account, gestisce attività/alloggi/spostamenti/check list. Nota: la collaborazione non è in tempo reale (niente Supabase Realtime, i dati si aggiornano al ricaricamento). Restano il blocco "lancio" (1.4 PWA/mobile, 1.12 deploy) e l'import Notion (1.11).

---

## FASE 2: Check List + Spese condivise

**Durata stimata:** 1-1.5 settimane  
**Prerequisiti:** Fase 1 completata  
**Deliverable:** Check list personalizzata + spese condivise stile Tricount

### 2.1 Check List avanzata (ex Packing List)

> La base (voci, categorie e icone personalizzate, checkbox "preparato", progresso, filtri) è già in Fase 1, sezione 1.8b. Qui restano solo le funzioni avanzate.

- [x] Form aggiungi voce, checkbox preparato, edit/delete, CRUD — vedi 1.8b
- [ ] Voci assegnate a una persona / vista "la mia lista"
- [ ] Template salvati (es. "Estate Europa")
- [ ] Condivisione template tra utenti
- **Status:** 🟡 In Progress (base fatta, mancano per-persona e template)

### 2.2 Spese - Base
- [x] Migration `0038_expenses.sql`: tabelle `expenses`, `expense_splits`, `expense_categories` + RLS; RPC `save_expense` che scrive spesa e ripartizione in un'unica transazione verificando che i conti tornino
- [x] Tab **Spese** (`components/trip/expenses/`): form con chi ha pagato, importo, valuta, categoria, data, titolo, note
- [x] Categorie predefinite + categorie personalizzate per viaggio (nome + icona, come la check list)
- [x] Lista spese con filtri sticky per categoria e per persona
- [x] Edit/delete: chi l'ha creata oppure owner/editor; **qualunque partecipante accettato (anche viewer) può inserire** le proprie spese
- [x] Pagatore e beneficiari sono righe di `trip_participants`, quindi funzionano anche i compagni senza account (1.9c)
- **Status:** 🟢 Done

### 2.3 Logica di ripartizione
- [x] Selezione delle persone coinvolte nella spesa
- [x] Modalità: **equa**, **per importi** (personalizzato), **per quote** (pesi, es. 2 = doppia quota)
- [x] **Rimborsi** tra persone (`kind = 'transfer'`) per saldare i debiti
- [x] Tabella `expense_splits` con quota e peso per partecipante
- **Status:** 🟢 Done

### 2.4 Tassi di cambio
- [x] Tassi da **open.er-api.com** (free, senza chiave — scelto al posto di ExchangeRate-API con registrazione), `fetchExchangeRates` in `lib/countryInfo.ts`, condiviso con il convertitore di Info Paese
- [x] Tasso proposto in automatico nel form e modificabile a mano
- [x] Snapshot del tasso salvato sulla spesa (`expenses.exchange_rate`: 1 unità della valuta spesa = N unità della valuta del viaggio)
- [x] Valuta di riferimento del viaggio configurabile (`trips.expense_currency`, default EUR)
- **Status:** 🟢 Done

### 2.5 Riepilogo Spese & Debiti
- [x] Grafici riepilogo (`ExpenseCharts`): totale per categoria e per persona
- [x] Saldi (`ExpenseBalances`): quanto ha pagato e quanto deve ciascuno
- [x] Calcolo automatico "chi deve quanto a chi" stile Splitwise/Tricount, con azione per registrare il rimborso
- [ ] Esporta PDF riepilogo
- **Status:** 🟡 In Progress (manca solo l'export PDF)

### 2.6 Multi-Currency Handling
- [x] Spese in valute diverse nello stesso viaggio
- [x] Conversione con il tasso del momento della spesa
- [x] Totali e saldi nella valuta del viaggio
- [ ] Test caso complesso: spese EUR, THB, USD nello stesso viaggio
- **Status:** 🟢 Done (manca il test strutturato)

### 2.7 Testing & Bugfix
- [ ] Test scenari di ripartizione (equa/importi/quote)
- [ ] Test conversioni multi-valuta
- [ ] Test arrotondamenti (centesimi, valute senza decimali)
- [ ] Test RLS spese (viewer inserisce, non modifica quelle altrui)
- [ ] Test export PDF
- **Status:** ⏳ Not Started

**Checkpoint Fase 2:** ✅ Spese condivise complete, ripartizione flessibile, multi-valuta, debiti chiari. Restano export PDF, check list per persona/template e test strutturati.

---

## FASE 3: Info Paese + Meteo + Calendario + Chat

**Durata stimata:** 1.5-2 settimane  
**Prerequisiti:** Fase 1 completata  
**Deliverable:** Info pratiche, meteo, calendario del viaggio, chat collaborativa

### 3.1 Sezione Info Pratiche Paese
- [x] Tab **Info Paese** (`CountryInfoSection.tsx`) con una scheda orizzontale per ogni paese del viaggio
- [x] Dati da dataset `world-countries` via CDN jsDelivr (al posto di REST Countries): capitale, lingue, valuta, fusi orari (con differenza rispetto a te), prefisso telefonico, lato di guida
- [x] Paesi di solo transito (scali) mostrati a parte; il proprio paese (nazionalità del profilo) escluso
- [~] Caching: cache lato client; nessuna copia in DB (non serve)
- **Status:** 🟢 Done

### 3.1b Link Sicurezza — Viaggiare Sicuri (Farnesina)
- [x] Pulsante per ogni paese di destinazione verso `https://www.viaggiaresicuri.it/find-country/country/{ISO3}` (alpha-3 dal dataset paesi)
- [x] Un pulsante per paese con bandierina + badge Farnesina, apertura in nuova scheda
- [x] Posizionato in cima al tab Info Paese
- **Status:** 🟢 Done

### 3.1c Frasario Utile (Traduzioni Lingua Locale)
- [x] Lingua/e del paese dal dataset paesi; selettore se il paese ne ha più di una
- [x] Dataset statico in `lib/phrasebook.ts` (non JSON in `/public` né tabella Supabase): per ogni frase testo italiano, inglese, frase locale in script originale e **pronuncia leggibile in italiano**
- [x] **31 lingue + 3 varianti regionali**, 39 frasi ciascuna:
  - Europa: inglese, francese, spagnolo, tedesco, portoghese, italiano (per chi arriva in Italia, nascosto agli utenti di nazionalità italiana), greco, rumeno, bulgaro, russo, ucraino, serbo, croato, polacco, ceco, ungherese, olandese
  - Asia e Medio Oriente: giapponese, cinese, coreano, thailandese, vietnamita, indonesiano, malese, hindi, arabo, ebraico, turco
  - Africa: swahili (Kenya, Tanzania/Zanzibar, Uganda), amarico (Etiopia, alfabeto ge'ez), malgascio (Madagascar); per il resto del continente coprono già arabo, francese, inglese e portoghese
  - Varianti scelte in automatico dal paese (`REGIONAL_VARIANTS`): inglese britannico (GB), **portoghese brasiliano** (BR) e **arabo marocchino / darija** (MA)
  - Alias (`aliases`): il serbo, in alfabeto latino, copre anche Montenegro ("Montenegrin") e Bosnia ("Bosnian")
- [x] Pronuncia rumena: â/î volutamente omesse nella trascrizione italiana (es. `mnca`, `kt`), scelta concordata con madrelingua
- [ ] Revisione da parte di madrelingua delle trascrizioni aggiunte il 15/10 (non verificate), in particolare malgascio, amarico e darija
- [x] 7 categorie: allergie e diete, saluti, cibo, bisogni base, emergenze, orientamento e trasporti, cortesia
- [x] Lista raggruppata per categoria (collassabile) con ricerca
- [x] Tap su una frase → vista "schermo grande" (modale) da mostrare alla persona del posto
- [x] Fallback per lingue non coperte: messaggio + link a Google Translate
- [x] Icona per ogni frase nella vista grande (Lucide + `BreadIcon` disegnata a mano: una pagnotta al posto del croissant)
- **Status:** 🟢 Done

### 3.1d Usanze
- [x] Nuova sotto-scheda **Usanze** in Info Paese (`CustomsPanel.tsx`), una scheda per ogni paese del viaggio
- [x] Dati curati a mano in `lib/customs.ts` (ottobre 2026), IT/EN, **58 paesi** tra le mete più comuni: orari tipici dei pasti, mance, weekend (se diverso da sabato-domenica), e quattro sezioni — **vietato per legge**, **gesti**, **da evitare**, **normale lì**
- [x] **Feste nazionali durante il viaggio** da Nager.Date (gratis, senza chiave, cache locale): solo le feste di tutto il paese. Non copre Thailandia, India, Emirati, Maldive, Israele, Malesia e non include le feste islamiche
- [x] **Nome italiano e spiegazione di ogni festa** (`lib/holidayInfo.ts`): dizionario con eccezioni per paese per i nomi ambigui (es. "Independence Day", il Labor Day americano a settembre); copre 589 delle 592 feste dei paesi con usanze. Restano senza spiegazione TN "Revolution Day", BG "Currency change day", DK "Bank closing day" (da verificare)
- [x] Periodi scritti a mano con due testi distinti: **cos'è la festa** e **cosa cambia per chi viaggia**
- [x] **Feste regionali** (Germania, Austria, Svizzera, Spagna, Portogallo, Regno Unito, USA, Canada, Australia, Nuova Zelanda, San Paolo): le mete del viaggio vengono collocate nella loro regione con i confini dell'atlante (`regionAt`) e i codici ISO 3166-2 di Nager.Date (`lib/subdivisions.ts`). Le feste che toccano le tue mete compaiono con "Vale a Monaco (Baviera)"; le altre in un elenco richiudibile con "Solo in: …"
- [x] Riga **"Nei giorni di festa"** per ogni paese (`HOLIDAY_NOTES` in `customs.ts`): cosa chiude e cosa resta aperto (es. Germania: supermercati chiusi come la domenica; USA: negozi aperti e saldi; Australia: sovrapprezzo festivo nei caffè)
- [ ] Feste patronali delle singole città (es. La Mercè a Barcellona): Nager.Date arriva solo al livello regionale
- [ ] Facoltativo: segnalare le feste nei 2-3 giorni prima e dopo il viaggio (traffico, voli)
- [x] **Periodi che cambiano il viaggio** (Ramadan ed Eid, Capodanno lunare, Golden Week cinese e giapponese, Obon, Songkran, Nyepi a Bali, Yom Kippur, Diwali, Holi, Chuseok, Tết, Carnevale di Rio, Día de Muertos, Oktoberfest), con badge "Durante il tuo viaggio" quando le date si sovrappongono
- [x] Date dei periodi **calcolate per qualsiasi anno**, senza API (`lib/calendars.ts`): calendari islamico, cinese, coreano ed ebraico via `Intl` del browser; Diwali, Holi e Nyepi con regole sulle fasi lunari (verificate sulle date reali 2019-2027); Carnevale dalla Pasqua; Oktoberfest dalla regola ufficiale. Margine ±1 giorno per le feste lunari (avvistamento della luna)
- [x] Riquadro **Anno e calendario**: zodiaco lunare per Cina, Taiwan, Hong Kong, Macao, Singapore, Corea e Vietnam (con le varianti vietnamite Bufalo e Gatto), era imperiale giapponese, era buddista thai, anno Minguo di Taiwan, calendario etiope, persiano (Iran, Afghanistan), islamico (Arabia Saudita), ebraico, Vikram Samvat (Nepal). Calcolato alla data di partenza, o a oggi se il viaggio non ha date
- [x] Rimando a Viaggiare Sicuri in fondo a ogni paese ("le leggi cambiano")
- [x] Info Paese caricata solo all'apertura della scheda (chunk separato da ~190 KB)
- [ ] Revisione dei contenuti (soprattutto i divieti di legge) e aggiornamento periodico
- [ ] Estendere ad altri paesi (oggi: messaggio "usanze non ancora disponibili" + solo feste)
- [ ] Facoltativo: riquadro "Da sapere" in Panoramica con i divieti di legge più gravi; voce suggerita in Check List (es. farmaci in Giappone)
- **Status:** 🟢 Done

### 3.2 Tasso Cambio Real-Time
- [x] Pannello convertitore valuta (`CurrencyPanel`): valuta di casa ↔ valuta locale
- [x] Tassi da open.er-api.com (free, senza chiave), condivisi con le spese (2.4), con fonte indicata
- **Status:** 🟢 Done

### 3.3 Prese Elettriche
- [x] Dataset paesi → tipi di presa + voltaggio + frequenza (`lib/plugs.ts`)
- [x] Icone delle prese (`PlugTypeIcon`), indicazione "compatibile" / "serve adattatore" rispetto alle prese di casa
- [x] Avviso se il voltaggio è diverso
- [ ] Link a negozi online (opzionale, non previsto)
- **Status:** 🟢 Done

### 3.4 Meteo
- [x] Integrazione Open-Meteo (no auth), `lib/weather.ts` + `WeatherPanel`
- [x] Meteo sui giorni del viaggio con tre fonti: previsioni (forecast), archivio storico (dal 1940) per i viaggi passati, medie climatiche quando le date sono troppo lontane
- [x] Temperatura, precipitazioni, icone meteo; fonte indicata
- **Status:** 🟢 Done

### 3.5 Sezione Documenti
- [x] ~~Upload documenti~~ — **tab rimossa** (commit `c026f7d`): fuori scope per ora. Prenotazioni e codici stanno già in Spostamenti/Alloggi/Attività
- **Status:** ❌ Rimosso dallo scope (da rivalutare solo se emerge un bisogno reale, es. passaporto/visti con scadenza)

### 3.6 Chat/Note Condivise
- [ ] UI chat thread per viaggio
- [ ] Messaggi in tempo reale (Supabase Realtime) o polling
- [ ] Display user avatar + nome + timestamp
- [ ] Markdown support (opzionale)
- [ ] Notifiche @ mention (opzionale Fase 4)
- **Status:** ⏳ Not Started

### 3.7 Timeline Interattiva → Calendario
- [x] Tab **Calendario** (prima tab del viaggio), viste **giorno** e **settimana** (`CalendarSection.tsx`)
- [x] Spostamenti, alloggi e attività posizionati cronologicamente, con barra colore per tipo e icone
- [x] Spostamenti divisi in evento di partenza e di arrivo (aeroporto/stazione/porto, terminal, indirizzo), badge biglietto con logo operatore e numero
- [x] Alloggi con logo della piattaforma; bandierina del paese accanto all'orario
- [x] Drag-and-drop desktop per spostare attività su altro giorno/orario
- [x] Giorni fuori dalle date del viaggio in tono smorzato; click su un evento porta alla tab relativa
- **Status:** 🟢 Done

### 3.8 Testing & Bugfix
- [ ] Test API esterne (dataset paesi, Open-Meteo, open.er-api) e comportamento offline/errore
- [ ] Test chat real-time
- [ ] Test calendario su mobile
- **Status:** ⏳ Not Started

**Checkpoint Fase 3:** ✅ Info paese complete (sicurezza, prese, valuta, meteo, frasario) e calendario interattivo. Manca la chat; Documenti rimosso dallo scope.

---

## FASE 4: Notifiche + Post-Viaggio Report

**Durata stimata:** 1 settimana  
**Prerequisiti:** Fase 1, 2, 3 completate  
**Deliverable:** Sistema notifiche, report post-viaggio, archiviazione

### 4.1 Sistema Notifiche
- [ ] Email reminder 24h prima check-in volo
- [ ] Email reminder mattina checkout hotel
- [ ] Email reminder attività pianificate (es. 2h prima)
- [x] Avvisi in-app di base (`0035_trip_notifications.sql`, `TripNotices`): "sei stato rimosso dal viaggio" e "il viaggio è stato eliminato" (`0039`). Scritti solo da RPC `security definer`, il destinatario li legge e li chiude
- [x] Inviti in sospeso visibili in dashboard (`PendingInvites`) e richieste di amicizia in `/travelers` — ma senza campanella globale
- [ ] In-app notification (badge/campanella) — includere il badge per gli inviti in sospeso, rimandato da 1.9
- [ ] Notifiche quando qualcuno invita, aggiunge info, chiede rimborso
- [ ] **Invito via canale esterno** (WhatsApp/Telegram/email) per chi non ha ancora un account — vedi nota in 1.9 "Flusso invito"; genera un link condivisibile che collega la persona all'invito in sospeso dopo la registrazione/login
- [ ] Impostazioni notifiche per utente
- **Status:** 🟡 In Progress (solo avvisi di rimozione/eliminazione; niente email, campanella o invito esterno)

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

**Checkpoint Fase 4:** ⏳ Da fare quasi tutto: notifiche (email, campanella, invito esterno) e report post-viaggio.

---

## FASE 5: Atlante personale + Statistiche

**Durata stimata:** 1-1.5 settimane  
**Prerequisiti:** Tutte le fasi precedenti completate  
**Deliverable:** Dashboard statistiche globali, mappa mondiale scratch, analytics avanzate

### 5.1 Statistiche Dashboard Globali
- [x] Paesi visitati (contatore totale) — nell'atlante e nel profilo; breakdown per anno ancora da fare
- [x] Città visitate (contatore) — nell'atlante
- [ ] Spesa media per viaggio
- [ ] Viaggio più caro / più economico
- [ ] Viaggio più lungo (durata giorni)
- [ ] Luogo più lontano (calcolo distanza coordinate)
- [ ] Compagni di viaggio più frequenti (ranking)
- [ ] Trending: mete revisitate
- **Status:** 🟡 In Progress (solo i contatori dell'atlante; manca una pagina/sezione statistiche)

### 5.2 Grafici Analytics
- [ ] Spesa per anno (bar chart)
- [~] Spesa per categoria (pie chart) — esiste per il singolo viaggio (`ExpenseCharts`), manca l'aggregato su tutti i viaggi
- [ ] Timeline viaggi (timeline view)
- [ ] Paesi per frequenza (world heatmap opzionale)
- **Status:** ⏳ Not Started

### 5.3 Atlante personale (ex Scratch Map) — `/atlas`

> **Scelta tecnica diversa dalla spec:** niente Cobe né Leaflet. Globo e mappa piatta sono disegnati in SVG con **d3-geo** + **world-atlas** (TopoJSON Natural Earth), in un unico componente con due proiezioni (ortografica / Natural Earth). Confini regionali in `public/regions/{ISO3}.json` (≈200 paesi), bandiere e capitali ospitate in locale (`public/flags`, `public/capitals.json`). Nessuna basemap a tasselli, nessuna chiave.

**Setup Librerie & Dati:**
- [x] `d3-geo`, `topojson-client`, `world-atlas` al posto di Cobe/Leaflet
- [x] Confini regionali per paese (≈200 file GeoJSON in `public/regions`), caricati solo quando si entra nel paese
- [x] Bandiere (paesi e regioni) e capitali self-hosted
- [ ] Cache offline dei GeoJSON (dipende dal service worker, 1.4)
- **Status:** 🟢 Done

**Globo e mappa piatta:**
- [x] Toggle Globo ↔ Mappa piatta, colorazione unica condivisa
- [x] Globo con auto-rotazione e pulsante pausa; drag per ruotare, zoom con rotella e pulsanti +/−/reset
- [x] Stati colorati per **stato**, non per numero di visite: sbloccato, di passaggio (scalo, tratteggiato), in programma, casa
- [x] Legenda dei colori
- [x] Tooltip con bandiera e nome tradotto; click su un paese → pannello laterale con i viaggi (date nei badge) e contatore viaggi
- [x] Passaggio animato "fly-to" dal mondo alla mappa regionale del paese
- [ ] Heatmap per numero di visite (1 = chiaro, 5+ = scuro) — non fatta, scelta la colorazione per stato
- **Status:** 🟢 Done

**Regioni, territori e stati non riconosciuti:**
- [x] Mappa regionale per paese (regioni italiane, 50 stati USA, province, ecc.) con nomi tradotti e bandiere regionali
- [x] Gli USA contano come 50 stati
- [x] Stati a riconoscimento limitato (codici `X-...`, es. Abcasia) e territori con il loro stato sovrano ("dipende da")
- [x] Piccoli stati e isole lontane rese cliccabili (marker dedicati)
- [x] Capitali (`CapitalMarker`), puntini delle città visitate e degli scali, etichette città localizzate, segnaposto casa
- **Status:** 🟢 Done

**Dati & segni manuali:**
- [x] Calcolo in memoria di paesi/regioni dalle mete dei viaggi (posseduti + a cui si partecipa + viaggi ricordo, 1.13), aggiornato a ogni caricamento
- [x] **Segni a mano** (`0040_atlas_marks.sql`): segnare/togliere un paese o una regione visitata senza viaggio; righe private per utente
- [x] Conteggi del profilo pubblico allineati all'atlante (`0041`)
- **Status:** 🟢 Done

**Statistiche widget:**
- [x] Riquadri: paesi sbloccati (con % del mondo), continenti, viaggi fatti/in programma, città visitate, paesi di passaggio, territori e non riconosciuti in più
- [x] **Bacheca bandiere** (`CountryFlagsBoard`): tutte le bandiere dei paesi sbloccati, raggruppate
- [ ] "Regione più visitata" / "ultimo viaggio aggiunto"
- **Status:** 🟢 Done (mancano i due widget minori)

**Ricerca:**
- [ ] Ricerca con autocompletamento su paesi e regioni
- **Status:** ⏳ Not Started

**Export & Sharing:**
- [ ] Export PNG della mappa
- [ ] Export CSV delle regioni visitate
- [ ] Export GeoJSON (opzionale)
- [ ] Link pubblico in sola lettura / QR code
- **Status:** ⏳ Not Started

**Testing & Performance:**
- [ ] Code-splitting della pagina Atlante (oggi finisce nel bundle principale, vedi 1.10)
- [ ] Test su mobile (pinch-zoom, pan, toggle vista)
- [ ] Test con molti paesi/regioni colorati
- **Status:** ⏳ Not Started

**Checkpoint Fase 5.3:** ✅ Atlante funzionante con globo, mappa piatta, regioni, segni manuali e statistiche; popolamento automatico dai viaggi. Mancano ricerca ed export.

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

**Checkpoint Fase 5:** 🟡 Atlante fatto; restano statistiche e grafici globali, filtri per anno, ricerca ed export della mappa.

---

## FASE 6: Admin Dashboard — Metriche Servizio

**Durata stimata:** 0.5 settimane  
**Prerequisiti:** Fase 1 completata (auth + profili)  
**Deliverable:** Pannello web privato per admin — metriche aggregate anonime + stima consumi Supabase free tier

> ⚠️ **Privacy by design**: nessun dato personale esposto, nessun viaggio, nessun contenuto utente.
> Tutte le query restituiscono solo contatori aggregati.

### 6.1 Ruolo Admin

#### Schema DB
- [ ] Migration `00XX_admin_role.sql` (prima numerazione libera, oggi `0044`): aggiungere colonna `is_admin boolean not null default false` a `public.profiles`
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
| 1 | 1.5 | 1.5 | 🟡 90% |
| 2 | 1.25 | 2.75 | 🟡 80% |
| 3 | 1.75 | 4.5 | 🟡 70% |
| 4 | 1 | 5.5 | 🟡 10% |
| 5 | 1.25 | 6.75 | 🟡 50% |
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
