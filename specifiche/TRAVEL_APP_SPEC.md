# Travel Management Web App - Specifica Completa

## 1. Panoramica del Progetto

**Obiettivo:** Web app per la pianificazione e gestione collaborativa dei viaggi. Sostituisce il workflow Notion attuale.

**Stack tecnologico:**
- Frontend: React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: C# ASP.NET Core (Minimal APIs)
- Database: Supabase (PostgreSQL)
- Autenticazione: Supabase Auth (email/password + OAuth Google/Apple)
- Storage: Supabase Storage (documenti, con free tier 1GB)
- Costo: Zero (tutto gratis)

---

## 1.5 PWA (Progressive Web App) & Multi-Platform

### 1.5.1 PWA Setup
- App installabile su iPhone, Android, Desktop
- Funziona come app nativa (full screen, icon home, splash screen)
- Service worker per offline support (opzionale Fase 2)
- `manifest.json` con metadata (nome, icone, theme-color)
- HTTPS obbligatorio (su Vercel/hosting)
- Aggiungere "Add to Home Screen" prompt su mobile

### 1.5.2 Responsive Design
- Mobile-first approach
- Breakpoints: mobile (0-640px), tablet (640-1024px), desktop (1024px+)
- Touch-friendly buttons (min 44px x 44px)
- Vertical layout su mobile, grid su desktop

### 1.5.3 Dark/Light Mode
- Toggle theme switch (header)
- Persisti preferenza in localStorage
- Default: segui system preference (prefers-color-scheme)
- Tailwind dark mode via `className="dark"`
- Palette:
  - **Light:** Sfondo bianco/grigio chiarissimo, testo scuro
  - **Dark:** Sfondo grigio scuro (#0F172A), testo grigio chiaro
  - Accent blu e oro in entrambi i temi

### 1.5.4 Internazionalizzazione (i18n)
- Libreria: `i18next` + `react-i18next`
- Due file JSON: `en.json` e `it.json` in `/public/locales/{lang}/translation.json`
- Struttura JSON gerarchica per categorie (button, label, error, message, etc)
- Esempio:
  ```json
  {
    "nav": {
      "dashboard": "Dashboard",
      "logout": "Esci"
    },
    "forms": {
      "tripName": "Trip Name",
      "startDate": "Start Date"
    }
  }
  ```
- Language selector nel profile/settings
- URL language prefix opzionale (es. `/en/trips`, `/it/trips`)
- Default: detecta da browser language, fallback EN

---

## 2. Design System & Branding

### 2.1 Palette Colori (Premium Blue & Gold)

**Primary Colors:**
- **Deep Blue:** `#003366` (HEX) / `rgb(0, 51, 102)` - Headings, buttons primari, accent
- **Light Blue:** `#4A90E2` - Links, hover states
- **Gold:** `#D4AF37` / `#FFD700` - Accent, badges, highlights, premium feel
- **Cream/Off-White:** `#F5F3F0` - Background light mode
- **Dark Navy:** `#0F172A` - Background dark mode

**Semantic Colors:**
- **Success:** `#10B981` (Emerald)
- **Warning:** `#F59E0B` (Amber)
- **Error:** `#EF4444` (Red)
- **Info:** `#3B82F6` (Blue)

**Grayscale:**
- Light mode: White, Slate-50, Slate-100, Slate-200, ... Slate-900
- Dark mode: Slate-950, Slate-900, ... Slate-50, White

### 2.2 Typography (Premium)
- **Font Family:**
  - Headlines: `Poppins` (bold, geometric, premium feel)
  - Body text: `Inter` (clean, modern, readable)
  - Fallback: `system-ui, -apple-system, sans-serif`
- **Font Sizes:**
  - H1: 2.5rem (headings sezione principale)
  - H2: 2rem (sottotitoli)
  - H3: 1.5rem (card titles)
  - Body: 1rem (testo base)
  - Small: 0.875rem (labels, helper text)
  - Tiny: 0.75rem (captions)

### 2.3 Component Style
- **Buttons:**
  - Primary (Deep Blue + Gold border): `bg-blue-900 border-2 border-gold text-white hover:bg-blue-800`
  - Secondary (Gold outline): `bg-transparent border-2 border-gold text-gold hover:bg-gold/10`
  - Tertiary (subtle): `bg-slate-100 text-slate-900 hover:bg-slate-200`
  - Dark mode: inverted backgrounds
  - Border-radius: `rounded-lg` (8px)
  - Min height: 44px (touch-friendly)
- **Cards:**
  - Border: `border-l-4 border-gold` (left accent)
  - Shadow: `shadow-lg` light mode, `shadow-xl dark:bg-slate-800` dark mode
  - Padding: `p-6`
  - Background: white/cream light, dark-navy dark
- **Inputs:**
  - Border: `border-2 border-slate-300 focus:border-gold focus:ring-gold/20`
  - Placeholder color: `text-slate-500`
  - Padding: `px-4 py-3`
- **Badges/Pills:**
  - Gold background: `bg-gold text-blue-900 font-semibold`
  - Status badges: colori semantic (success, warning, error)

### 2.4 Spacing & Layout
- Base unit: 8px (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Grid: 12 colonne responsive
- Padding sections: 24px mobile, 48px desktop
- Gap between elements: 16px (cards), 8px (compact lists)

### 2.5 Micro-Interactions
- Transitions: 200-300ms (fade, slide, scale)
- Hover states: 10% opacity change
- Loading spinner: animated gold ring
- Toast notifications: slide-in from top, auto-dismiss 3s
- Empty states: illustration + friendly message

### 2.6 Dark Mode Implementation
- Tailwind config: `darkMode: 'class'`
- Root `<html className={isDarkMode ? 'dark' : ''}>` toggle
- Use Tailwind dark: prefix per every color
- Example: `bg-white dark:bg-slate-900 text-slate-900 dark:text-white`

### 2.7 Internazionalizzazione (i18n) - Implementazione

**Setup librerie:**
```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

**Struttura file:**
```
/src
  /i18n
    └─ config.ts (configurazione i18next)
/public/locales
  /en
    └─ translation.json
  /it
    └─ translation.json
```

**File `/src/i18n/config.ts`:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

**Esempio `/public/locales/en/translation.json`:**
```json
{
  "common": {
    "appName": "JourneyAtlas",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!"
  },
  "nav": {
    "dashboard": "Dashboard",
    "myTrips": "My Trips",
    "profile": "Profile",
    "logout": "Logout",
    "settings": "Settings"
  },
  "dashboard": {
    "welcome": "Welcome, {{name}}!",
    "createTrip": "Create New Trip",
    "noTrips": "No trips yet. Start planning your next adventure!",
    "statistics": "Travel Statistics",
    "countriesVisited": "Countries Visited",
    "citiesVisited": "Cities Visited"
  },
  "trip": {
    "name": "Trip Name",
    "destination": "Destination",
    "startDate": "Start Date",
    "endDate": "End Date",
    "budget": "Budget",
    "participants": "Participants"
  },
  "expenses": {
    "youOwe": "You owe {{amount}} {{currency}} to {{person}}",
    "owesYou": "{{person}} owes you {{amount}} {{currency}}"
  }
}
```

**Esempio `/public/locales/it/translation.json`:**
```json
{
  "common": {
    "appName": "JourneyAtlas",
    "save": "Salva",
    "cancel": "Annulla",
    "delete": "Elimina",
    "edit": "Modifica",
    "close": "Chiudi",
    "loading": "Caricamento...",
    "error": "Si è verificato un errore",
    "success": "Successo!"
  },
  "nav": {
    "dashboard": "Dashboard",
    "myTrips": "I Miei Viaggi",
    "profile": "Profilo",
    "logout": "Esci",
    "settings": "Impostazioni"
  },
  "dashboard": {
    "welcome": "Benvenuto, {{name}}!",
    "createTrip": "Crea Nuovo Viaggio",
    "noTrips": "Nessun viaggio ancora. Inizia a pianificare la tua prossima avventura!",
    "statistics": "Statistiche di Viaggio",
    "countriesVisited": "Paesi Visitati",
    "citiesVisited": "Città Visitate"
  },
  "trip": {
    "name": "Nome Viaggio",
    "destination": "Destinazione",
    "startDate": "Data Inizio",
    "endDate": "Data Fine",
    "budget": "Budget",
    "participants": "Partecipanti"
  },
  "expenses": {
    "youOwe": "Devi {{amount}} {{currency}} a {{person}}",
    "owesYou": "{{person}} ti deve {{amount}} {{currency}}"
  }
}
```

**Utilizzo nei componenti:**
```typescript
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('dashboard.welcome', { name: 'Simone' })}</h1>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('it')}>Italiano</button>
    </div>
  );
}
```

**Integrazione nel main App.tsx:**
```typescript
import './i18n/config'; // import all'inizio
import App from './App';

// App.tsx è già wrappato da i18n
```

---

## 3. Autenticazione e Accesso

### 3.1 Metodi di Login
- Email + Password (tramite Supabase Auth)
- OAuth Google (gratuito)
- OAuth Apple (gratuito)
- Registrazione self-service

### 2.2 Gestione Account
- Profilo utente (nome, email, foto)
- Dashboard personale con lista dei propri viaggi
- Gestione preferenze (lingua, fuso orario, valuta default)

### 2.3 Condivisione Viaggi
- Proprietario viaggio può invitare partecipanti via email o link condivisione
- Invitato riceve notifica (se account esiste, viaggio appare in dashboard)
- Se invitato non ha account, lo crea primo, poi viaggio gli appare in dashboard
- Livelli di accesso: Editor (modifica tutto), Viewer (legge solo), Owner (gestisce chi accede)

---

## 3. Struttura Principale: Viaggio

Ogni **viaggio** è l'entità centrale e contiene:

### 3.1 Metadati Viaggio
- Nome viaggio
- Date inizio/fine
- Mete (una o più città/paesi)
- Partecipanti (con ruolo)
- Immagine copertina
- Note generali
- Budget totale pianificato

### 3.2 Sezioni Contenute nel Viaggio

#### **A. Attività**
- Lista attività con stato: Pianificata / Prenotata / Completata
- Per ogni attività:
  - Nome, descrizione
  - Data e orario
  - Luogo (città, indirizzo)
  - Chi l'ha aggiunta
  - Note (es. link booking, numero prenotazione)
  - Categoria (es. Attrazione, Ristorante, Transport, Evento)

#### **B. Alloggi**
- Una o più proprietà per viaggio
- Per ogni alloggio:
  - Nome proprietà
  - Indirizzo e coordinate
  - Tipo (hotel, airbnb, casa, appartamento)
  - Check-in / Check-out date e orari
  - Costo totale
  - Numero camere e composizione (chi dorme dove)
  - Contatti proprietario, numero emergenza
  - Link booking, numero conferma
  - Note (es. wifi password, parcheggio)
  - Documenti upload (conferma, mappa, regole)

#### **C. Voli**
- Una o più tratte per viaggio
- Per ogni volo:
  - Aeroporto partenza/arrivo
  - Data e orario decollo/atterraggio
  - Compagnia aerea
  - Numero volo
  - Numero prenotazione
  - Chi sta su questo volo (non tutti i partecipanti necessariamente)
  - Bagagli inclusi, regole
  - Documenti upload (biglietto, boarding pass)

#### **D. Packing List**
- Una lista per persona (o per persona+viaggio)
- Categorie: Abbigliamento, Documenti, Toilette, Elettronica, Vario
- Checkbox per spuntare items portati
- Note per item (es. "giacca pesante solo se piove")
- Possibilità di template salvati (es. "Estate Europa", "Montagna")

#### **E. Expense Tracking & Split**
- Registro delle spese durante viaggio (e before/after)
- Per ogni spesa:
  - Chi ha pagato (partecipante)
  - Importo e valuta (es. 50 EUR, 100 THB)
  - Categoria (Alloggio, Cibo, Transport, Attrazione, Shopping, Vario)
  - Data
  - Descrizione
  - Per chi l'abbiamo pagata (selezione multipla, con split proporzionale o equo)
  - Note
- Riepilogo automatico:
  - Totale speso per categoria
  - Totale per persona
  - Chi deve rimborso a chi (debiti/crediti)
  - Conversione valute in tempo reale (tasso giornaliero)
- Storage supporta valute diverse nello stesso viaggio

#### **F. Info Pratiche Paese/Città**
- Per ogni meta (paese/città selezionata):
  - **Fuso orario** (con UTC offset)
  - **Valuta locale** (simbolo, codice ISO)
  - **Tasso di cambio** in tempo reale (verso EUR, USD, altre monete scelte)
  - **Prese elettriche** (tipo A-N, voltaggio, frequenza, immagini tipi)
  - **Voltaggio** (es. 220V, 50Hz)
  - **Meteo attuale e previsione** (7-14 giorni)
  - **Note di viaggio** (vaccinazioni consigliate, visa requirements, lingue, cultura)

#### **G. Documenti**
- Upload di file (PDF, foto): biglietti voli, conferme hotel, assicurazioni, passaporti (foto copie), visti, carte vaccini
- Per ogni documento:
  - Nome, tipo (volo, hotel, assicurazione, etc)
  - Data upload
  - Data scadenza (se rilevante)
  - Note
  - Metadati estratti (es. numero prenotazione, nome hotel, date)

#### **H. Timeline Interattiva (Fase 3)**
- Vista giorno per giorno del viaggio
- Asse temporale con voli, check-in hotel, attività posizionate cronologicamente
- Drag-and-drop per riordinare
- Colori per categoria (volo=blu, hotel=verde, attività=giallo)

#### **I. Note/Chat Condivisa (Fase 3)**
- Conversazione thread per viaggio
- Utile per coordinamento ("Ho cambiato ristorante per domani sera alle 20")
- Evita WhatsApp durante planning

#### **J. Report Post-Viaggio (Fase 4)**
- Archiviazione automatica
- Riepilogo spese finali e debiti/crediti
- Rating viaggio e note personali
- Galleria foto caricate dai partecipanti

---

## 4. Import da Notion (Data Migration)

### 4.1 Notion Integration
- Supporta export Notion → CSV/JSON
- Parser automatico per struttura Notion "Viaggi" template
- Mapping colonne:
  - Notion "Name" → trip.name
  - Notion "Start Date" → trip.start_date
  - Notion "End Date" → trip.end_date
  - Notion "Destinations" → trip.destinations (parsing testo)
  - Notion "Budget" → trip.budget_planned
  - Notion "Cover" → try image URL, altrimenti Unsplash
  - Nested relations (Activities, Accommodations, Expenses) → parse dove possibile
  
### 4.2 Upload Flow
- Pagina dedicata "/import" o sezione in Settings
- Drag-and-drop CSV/JSON da Notion
- Preview mapping: mostra preview di quello che verrà importato
- Opzione "Map Custom Fields" se struttura è diversa
- Salva a DB come viaggio normali (archived se concluso)
- Notifica: "X viaggi importati con successo"

### 4.3 Fallback Manuale
- Se Notion export non è perfetto, form manuale per aggiungere viaggio velocemente:
  - Nome viaggio
  - Destinazioni (una o più)
  - Date inizio/fine
  - Note (opzionali)
  - Salva come "journey skeleton" (senza attività dettagliate)
  - Utente può aggiungere dettagli later

---

## 5. Dashboard (Pagina principale)

### 5.1 Elementi Dashboard
1. **Pulsante "Crea Nuovo Viaggio"**
   - Click apre form:
     - Nome viaggio
     - Mete (autocomplete da API paesi: testo libero, suggerisce città/paesi)
     - Date inizio/fine
     - Budget pianificato
     - Partecipanti (da selezionare o invitare)
   - Al salvataggio:
     - Sistema chiama REST Countries API per dati paese
     - Chiama Open-Meteo per meteo
     - Chiama ExchangeRate-API per tassi cambio
     - Seleziona immagine di copertina da Unsplash API (basata su meta)
     - Crea viaggio in DB

2. **Griglia Viaggi Attuali**
   - Card per ogni viaggio (ordinati per data prossima partenza)
   - Su card: copertina, nome, date, mete, partecipanti
   - Click card = entra nel viaggio

3. **Archivio Viaggi Passati**
   - Vista separata dei viaggi conclusi (nascoste di default)

### 4.2 Statistiche Dashboard Globali
- **Paesi visitati** (contatore totale)
  - Breakdown per anno/periodo
- **Città visitate** (lista, con contatore)
- **Spesa media per viaggio**
- **Viaggio più caro / più economico**
- **Viaggio più lungo** (durata giorni)
- **Luogo più lontano** (da calcolare con coordinate)
- **Compagni di viaggio più frequenti**
- **Trending:** Mete visitate più volte

### 4.3 Mappa Scratch (Scratch Map) - Fase 5 - Dual View

**Visualizzazione Doppia (Selezionabile):**
- Toggle button: **3D Globe** ↔ **Flat Map (Mercatore)**
- Entrambe sincronizzate in tempo reale
- Utente sceglie vista preferita

#### **A. 3D Globe (Cobe - Ultra-Lightweight < 5KB)**

**Features:**
- Globo terrestre 3D interattivo, rotante
- Zoom/pan interattivo
- Rotazione automatica quando idle
- Auto-population: paesi colorati in base a visite
- Heatmap intensità colore: 1 visita = chiaro, 5+ = scuro
- Hover paese → tooltip con numero visite
- Click paese → drill-down: lista viaggio con date

**Libreria:** Cobe (MIT License)
- Peso: 5 KB gzipped
- React-compatible
- Zero dependencies

#### **B. Flat Map (Leaflet + GeoJSON)**

**Features:**
- Mappa rettangolare classica (proiezione Mercatore)
- Basemap OpenStreetMap (free)
- Supporto granulare - Livelli amministrativi:
  - **Livello 0:** Paesi mondo (250+) inclusi de facto states parzialmente riconosciuti
  - **Livello 1:** Suddivisioni principali (50 stati USA, province Canada, regioni Europa, etc)
  - **Livello 2:** Sottodivisioni (tutti i territori USA, autonomie, etc)
  - **Livello 3:** De facto states e territori contestati (15+ con status riconoscimento)
    - Post-Soviet: Abkhazia, South Ossetia, Transnistria, Nagorno-Karabakh (Artsakh)
    - Middle East/Balkans: Kosovo, Palestine, Northern Cyprus (TRNC)
    - Asia: Taiwan
    - Africa: Somaliland, Western Sahara (SADR)
    - Europa: Crimea, Donetsk, Luhansk (Ucraina)
  - Logica visualizzazione: unità principale (es. Cyprus) colora come blocco, drill-down mostra suddivisioni con badge riconoscimento
- Zoom nativo: mondo → continente → paese → regione
- Heatmap colori su tutte le suddivisioni
- Click regione → lista viaggio associati

**Libreria:** Leaflet (open-source)
- Peso: 40 KB
- Industry standard per mappe web
- Plugin ecosystem ricco

#### **Dati Geopolitici (GeoJSON - Tutti Gratis):**
- **Paesi mondo:** Natural Earth (naturalearthdata.com) - 250+ paesi
- **Stati USA:** Natural Earth Admin1 - 50 stati
- **Territori USA:** world-geojson GitHub - tutti i territori (Porto Rico, Guam, Virgin Islands, American Samoa, Mariana Islands)
- **Province/Regioni:** Natural Earth Admin1 - suddivisioni di tutti i paesi
- **De Facto States & Disputed Territories:** Natural Earth "disputed" layer + Wikipedia list
  - Post-Soviet: Abkhazia, South Ossetia, Transnistria, Nagorno-Karabakh (Artsakh)
  - Middle East: Kosovo, Palestine, Northern Cyprus (TRNC)
  - Asia: Taiwan
  - Africa: Somaliland, Western Sahara (SADR)
  - Europe: Crimea, Donetsk, Luhansk (Ucraina)
  - Totale: 15+ de facto states con diverso livello di riconoscimento internazionale

#### **Interazione Utente - Globo:**
- Drag per ruotare
- Scroll per zoom
- Click paese → mostra "Paese + N visite"
- Doppio-click paese → zoom in su globo
- Opzione "Pin journey skeleton" (new viaggio)

#### **Interazione Utente - Mappa:**
- Pan classico (drag)
- Zoom con mousewheel o +/- buttons
- Click stato/territorio → drill-down a dettagli
- Autocomplete search: "Search region" (fuzzy find)
- Toggle layer visibility:
  - ☑ Paesi
  - ☑ Stati USA
  - ☑ Territori USA
  - ☑ Province (altri paesi)

#### **Heatmap & Colorazione:**
- Intensità basata su numero visite:
  - 0 visite: grigio/bianco (unvisited)
  - 1 visita: colore chiaro
  - 2-4 visite: colore medio
  - 5+ visite: colore scuro (deep gold/blue)
- Legenda visibile su ambo le mappe
- Smooth transition tra colori

#### **Drill-Down (Entrambe le Viste):**
1. Hover regione → tooltip (nome + visite)
2. Click regione → modal/sidebar con:
   - Lista viaggio visitati in quella regione
   - Date viaggio
   - Link "View Trip Detail"
3. Click viaggio → enter trip detail page

#### **Export & Sharing:**
- Scarica mappa 3D: PNG via html2canvas (entrambe le viste)
- Scarica lista paesi: CSV (nome regione, visite, ultime date)
- Scarica GeoJSON: export dati geopolitici colorati
- Share link pubblico: link statico con mappa read-only (privacy: public/private)
- QR code: share su social o link

#### **Performance & Caching:**
- Carica GeoJSON on-demand da CDN (Unpkg, JSDelivr) - no server storage
- Cache GeoJSON in localStorage dopo primo carico (offline support)
- Lazy-render: globo + mappa separati, render solo view attiva
- Colorazione pre-calcolata in memoria (Map structure)

#### **Dataset Storage:**
- **Option 1 (MVP):** Carica GeoJSON da CDN (Unpkg)
  - URL pattern: `https://unpkg.com/world-geojson@3.0.0/countries/usa.json`
  - Zero server cost
  - Dipende da availability CDN (mitigabile con fallback locale)
  
- **Option 2 (Production):** Carica da Supabase Storage
  - Upload GeoJSON files once
  - Serve via Supabase CDN
  - Offline + faster

#### **Complementary Features:**
- **Statistics Widget:** Mostra nel corner:
  - Total paesi visitati
  - Total stati USA visitati
  - Total territori visitati
  - Viaggio più frequente (regione)
  - Ultimo viaggio aggiunto
- **"Add Custom Journey":** Pulsante in mappa per creare journey skeleton (name + dates + mete)

---

## 5. API Esterne Utilizzate (Cost Zero)

| API | Uso | Free Tier | Auth |
|-----|-----|-----------|------|
| **Supabase Auth** | Autenticazione + DB | Unlimited (free tier) | API Key env |
| **Supabase Storage** | File upload (documenti) | 1 GB gratis | API Key env |
| **REST Countries** | Dati paese (capitale, lingua, fuso, valuta, confini) | Unlimited, no auth | HTTP GET |
| **ExchangeRate-API** | Tassi cambio real-time | Unlimited (free tier) | API Key env |
| **Open-Meteo** | Meteo attuali + previsioni 7-14 giorni | Unlimited, no auth | HTTP GET |
| **Unsplash API** | Immagini copertina viaggio | 50 req/ora (free tier) | API Key env |
| **Aviationstack** | Dati voli real-time (numero, compagnia, orari) | 1000 req/mese | API Key env |
| **Natural Earth** | GeoJSON paesi, stati, suddivisioni admin | Unlimited, public domain | HTTP GET (CDN) |
| **world-geojson** | GeoJSON territori USA, province, confini precisi | Unlimited, open source | GitHub/NPM |

---

## 6. Database Schema (Supabase PostgreSQL)

### Tabelle Principali

```sql
-- Users (da Supabase Auth, extend con dati aggiuntivi)
users
├─ id (UUID)
├─ email
├─ display_name
├─ avatar_url
├─ default_currency
├─ timezone
├─ created_at

-- Trips
trips
├─ id (UUID)
├─ owner_id (user FK)
├─ name
├─ description
├─ start_date
├─ end_date
├─ destinations (JSON: [{city, country, coords}])
├─ budget_planned
├─ cover_image_url
├─ created_at
├─ updated_at
├─ archived_at

-- Trip Participants
trip_participants
├─ id (UUID)
├─ trip_id (FK)
├─ user_id (FK)
├─ role (owner, editor, viewer)
├─ invited_email (se non ancora account)
├─ joined_at

-- Activities
activities
├─ id (UUID)
├─ trip_id (FK)
├─ name
├─ description
├─ activity_date
├─ activity_time
├─ location_city
├─ location_address
├─ category (attrazione, ristorante, transport, evento)
├─ status (planned, booked, completed)
├─ booking_ref
├─ notes
├─ created_by_user_id
├─ created_at

-- Flights
flights
├─ id (UUID)
├─ trip_id (FK)
├─ departure_airport
├─ arrival_airport
├─ departure_datetime
├─ arrival_datetime
├─ airline
├─ flight_number
├─ booking_ref
├─ passengers (JSON: [{user_id, seat, baggage}])
├─ notes
├─ created_at

-- Accommodations
accommodations
├─ id (UUID)
├─ trip_id (FK)
├─ name
├─ type (hotel, airbnb, house, apartment)
├─ address
├─ coordinates (lat, lon)
├─ check_in_date
├─ check_in_time
├─ check_out_date
├─ check_out_time
├─ cost_total
├─ currency
├─ rooms (JSON: [{room_id, capacity, assigned_users}])
├─ contact_info
├─ booking_ref
├─ notes
├─ created_at

-- Expenses
expenses
├─ id (UUID)
├─ trip_id (FK)
├─ paid_by_user_id (FK)
├─ amount
├─ currency
├─ category
├─ description
├─ expense_date
├─ split_with (JSON: [{user_id, amount_owed, percentage}])
├─ notes
├─ created_at

-- Packing Lists
packing_lists
├─ id (UUID)
├─ trip_id (FK)
├─ user_id (FK)
├─ name (es. "Mio bagaglio")
├─ created_at

-- Packing Items
packing_items
├─ id (UUID)
├─ packing_list_id (FK)
├─ category (abbigliamento, documenti, toilette, elettronica, vario)
├─ item_name
├─ quantity
├─ packed (boolean)
├─ notes
├─ created_at

-- Documents
documents
├─ id (UUID)
├─ trip_id (FK)
├─ user_id (FK - chi ha uploadato)
├─ file_path (Supabase Storage)
├─ doc_type (volo, hotel, assicurazione, passport, visa, vaccine)
├─ doc_name
├─ expiry_date (nullable)
├─ metadata (JSON: estratti = booking_ref, hotel_name, flight_number, etc)
├─ uploaded_at

-- Destination Info (cache per performance)
destination_info
├─ id (UUID)
├─ country_code (ISO)
├─ city_name
├─ timezone
├─ currency_code
├─ exchange_rates (JSON: {EUR: 0.92, USD: 1.08, ...})
├─ weather (JSON: previsione meteo)
├─ electrical_plugs (JSON: [type_letter, voltage, frequency])
├─ cached_at

-- Visited Regions (per Scratch Map - aggregazione automatica da trips)
visited_regions
├─ id (UUID)
├─ user_id (FK users)
├─ region_name (es. "Cyprus", "Northern Cyprus", "Kosovo")
├─ region_level (0=country, 1=state/region, 2=subdivision, 3=de_facto_state)
├─ region_type (country, state, province, disputed_territory, de_facto_state)
├─ parent_region (FK visited_regions, nullable - es. Cyprus → Northern Cyprus)
├─ country_code (ISO 3166-1 alpha-2)
├─ visit_count (numero di volte visitato)
├─ trips_visited (JSON: [trip_id, trip_id, ...])
├─ recognition_status (fully_recognized, limited_recognized, unrecognized)
├─ recognized_by (JSON: ["Turkey", "Russia", ...] - per de facto states)
├─ last_visit_date
├─ geojson_id (ref a Natural Earth GeoJSON ID per performance)
├─ created_at
├─ updated_at
```

**Nota:** visited_regions viene auto-popolato scansionando tutti i trips dell'utente ed estraendo regioni dalle coordinate + geocoding. Abilita la Scratch Map a colorare dinamicamente tutte le unità visitate, inclusi de facto states con metadata di riconoscimento internazionale.

---

## 7. Flusso Utente Principale

### 7.1 Creare un Viaggio
1. Utente clicca "Crea Viaggio" da dashboard
2. Form: nome, mete (autocomplete), date, budget, partecipanti
3. Seleziona mete → backend chiama REST Countries + Open-Meteo + ExchangeRate
4. Sistema suggerisce immagine di copertina (Unsplash search per meta)
5. Utente clicca salva → viaggio creato, invite inviati ai partecipanti
6. Redirect a viaggio detail

### 7.2 Aggiungi Dettagli Viaggio
1. Entra viaggio detail → 9 sezioni (attività, alloggi, voli, etc)
2. Per ogni sezione, form per aggiungere item
3. Real-time sync tra utenti (partecipanti vedono cambiamenti live)
4. Upload documenti drag-and-drop a Supabase Storage
5. Expense tracking: aggiungi spesa → seleziona chi ha pagato, valuta, split
6. Sistema converte automaticamente valute diverse

### 7.3 View Meteo + Info Paese
1. Nella sezione "Info Pratiche" → click meta
2. Mostra meteo 7gg + prese + valuta + fuso orario
3. Tasso cambio in tempo reale per valuta locale

### 7.4 Genera Report Spese
1. Click "Riepilogo Spese" → vede debiti/crediti in tempo reale
2. Chi deve rimborso a chi
3. Totale speso per categoria
4. Esporta PDF per regolarsi dopo viaggio

---

## 8. Features Specifiche

### 8.1 Expense Split Intelligente
- **Problema:** Una spesa va divisa tra N persone, ma in valute diverse
- **Soluzione:**
  - Registra importo originale + valuta
  - Tasso cambio catturato nel momento della spesa (o manualmente se offline)
  - Split proporzionale o equo
  - Calcolo automatico chi deve a chi
  - Conversione finale in EUR o altra valuta per regolamento
- **Esempio:** Albergo 100 EUR pagato da Simone per tutti 4. Split equo = 25 EUR a testa. Se Marco pagò cibo 40 THB (≈1 EUR), deve 24 EUR a Simone.

### 8.2 Inviti e Accesso
- Utente manda invite a email non registrata → riceve link magic
- Link crea account + viaggio automaticamente aggiunto
- Se email già registrata → viaggio appare in dashboard

### 8.3 Immagini Copertina
- Gratuito via Unsplash API (no storage)
- Search: query = destination name
- Mostra 3 opzioni, utente sceglie
- URL salvato in DB (non file), Unsplash serve sempre versione fresca

### 8.4 Meteo
- Open-Meteo, zero auth, zero cost
- 7-14 giorni forecast
- Aggiornato ogni volta che apri sezione Info

### 8.5 Prese Elettriche
- Dataset hardcoded o caricato da Supabase
- Mapping: paese → [tipo A, B, C, F] + 220V, 50Hz
- Visual delle prese nel UI

---

## 9. Roadmap Fasi (vedi PHASES.md)

Diviso in 5 fasi, ognuna consegnabile e usabile.

---

## 10. Sicurezza e Privacy

- Tutti i dati encryptati in transit (HTTPS)
- Row-level security su Supabase (utente vede solo i suoi viaggi + quelli condivisi)
- Storage documenti: file privati, accesso solo ai partecipanti
- No cookie tracking, GDPR compliant
- Logout uccide la sessione
- API keys (ExchangeRate, Unsplash) sono server-side env vars

---

## 11. Performance & Caching

- Cache info paesi per 7 giorni (evita richieste API ripetute)
- Cache meteo per 6 ore
- Cache tassi cambio per 1 ora
- Real-time updates via WebSocket o polling su sezioni collaborative (chat, expense)
- Lazy-load documenti (non carica tutto all'apertura)

---

## 12. Note Implementative

**Linguaggi & Framework:**
- TypeScript ovunque (type safety)
- Supabase client library per React
- Tailwind + shadcn per UI coerente
- Responsivo mobile-first
- Dark mode supportato (Tailwind)
- Offline handling: form temporaneamente salvi offline, sync al riconnettere
- Notifiche via email (Supabase Auth, SendGrid free tier se serve)

**Librerie Specifiche - Scratch Map (Fase 5):**
```bash
npm install cobe              # 3D Globe (5 KB, ultra-lightweight)
npm install leaflet           # Flat Map (40 KB, industry standard)
npm install react-leaflet     # React wrapper per Leaflet
npm install geojson-normalize # GeoJSON utilities
npm install html2canvas       # Export mappa a PNG
npm install zustand           # State management mappe
```

**GeoJSON Loading Strategy:**
- **MVP:** CDN-based (Unpkg): `https://unpkg.com/world-geojson@3.0.0/`
- **Production:** Supabase Storage (caricamento una volta, serve via CDN)
- **Fallback:** localStorage caching dopo primo carico

**Dati GeoJSON da usare:**
```
/countries/           # Tutti paesi mondo (Natural Earth)
/states/usa/          # 50 stati USA
/territories/usa/     # 5 territori USA (PR, Guam, VI, AS, MP)
/admin1/              # Regioni/province di altri paesi
```

**Dataset Size:**
- World boundaries: ~500 KB (GZ)
- USA states: ~100 KB (GZ)
- Carica on-demand, non all'avvio

---

Vedi **PHASES.md** per dettagli esecuzione e priorità.
