# Travel App - Roadmap Fasi

## Stato Progetto

| Fase | Nome | Status | Completamento |
|------|------|--------|----------------|
| 1 | MVP Core (Auth + Viaggio Base) | 🟡 In Progress | 65% |
| 2 | Packing + Expense Split | ⏳ Not Started | 0% |
| 3 | Info Paese + Documenti + Chat | ⏳ Not Started | 0% |
| 4 | Timeline + Notifiche + Post-Report | ⏳ Not Started | 0% |
| 5 | Dashboard Analytics + Scratch Map | ⏳ Not Started | 0% |

**Ultimo aggiornamento:** 2026-09-16  
**Prossima milestone:** Fase 1 — inviti/condivisione partecipanti (1.9), poi import Notion (1.11) e PWA mobile (1.4)

---

## FASE 1: MVP Core - Auth + Viaggio Base

**Durata stimata:** 1-2 settimane  
**Deliverable:** Web app funzionante con viaggio basic, inviti, attività/alloggi/voli

### 1.1 Setup Infrastruttura
- [x] Creare progetto ASP.NET Core (Minimal APIs)
- [x] Setup React TypeScript + Tailwind + shadcn
- [~] Supabase project setup (database, auth, storage) — migration `supabase/migrations/0001_init.sql` pronta, da applicare nel SQL Editor
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
- [~] Supabase Auth integration (email/password) — client + AuthProvider pronti, test al primo avvio
- [ ] OAuth Google setup
- [ ] OAuth Apple setup
- [x] Login form UI (shadcn/ui)
- [x] Signup form UI
- [x] Logout + session management
- [x] Protected routes (redirect if not authenticated)
- [ ] User profile API endpoint
- **Status:** 🟡 In Progress

### 1.3 Database & Migrations
- [~] Creare tabelle: trips, trip_participants, activities, flights, accommodations (profile incluso) — da applicare `0001_init.sql`
- [~] Row-level security policies — incluse nella migration
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

### 1.9 Inviti e Condivisione
- [ ] API per invitare partecipante (email)
- [ ] Salvataggio invite nel DB (pending)
- [ ] Email notifica (SendGrid o Supabase built-in)
- [ ] Magic link per accettare invite (se non registrato, crea account prima)
- [ ] Aggiunta automatica al viaggio una volta accepted
- [ ] Gestione ruoli (owner, editor, viewer)
- [ ] Lista partecipanti nel viaggio detail
- **Status:** ⏳ Not Started

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
- [ ] In-app notification (badge)
- [ ] Notifiche quando qualcuno invita, aggiunge info, chiede rimborso
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
