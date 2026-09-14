# JourneyAtlas - Notion Import & Scratch Map Intelligence

## 1. Notion Import Strategy

### 1.1 Come Prepararsi in Notion

L'utente exporta il template Notion "Viaggi" come CSV o JSON. Struktura ideale:

```
Database: Viaggi
├─ Name (text)
├─ Start Date (date)
├─ End Date (date)
├─ Destinations (text o select multiplo)
├─ Budget (number)
├─ Status (select: Upcoming, In Progress, Completed, Archived)
├─ Cover Image (file)
├─ Participants (relation)
└─ (opzionale) Activities, Flights, Accommodations relations
```

**Export steps Notion:**
1. Apri database Viaggi
2. Click tre puntini → "Download" → "CSV" o "Markdown" (no JSON puro da UI)
3. File scaricato con tutte le righe e proprietà

### 1.2 Parsing CSV/JSON

**File da parsare:** CSV o JSON con struct minimale

```csv
Name,Start Date,End Date,Destinations,Budget,Status,Notes
Sicilia,2023-06-01,2023-06-15,"Palermo, Mondello, Mondello",1500,Completed,"Estate in famiglia"
Giappone,2024-01-10,2024-01-25,"Tokyo, Kyoto, Osaka",4000,Completed,"Primo viaggio Asia"
Londra,2024-03-01,2024-03-05,"Londra, Oxford",800,Completed,"Weekend europeo"
Estathé Famiglia 2015,2015-07-01,2015-08-01,"Spagna: Madrid, Barcelona, Valencia",null,Archived,"Viaggio infanzia - da memoria"
```

**Parser logica:**
```typescript
interface NotionTrip {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  destinations: string[]; // Parsing: split by comma, trim, geocode
  budget?: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'archived';
  notes?: string;
}

async function parseNotionCSV(file: File): Promise<NotionTrip[]> {
  const text = await file.text();
  const lines = text.split('\n');
  const header = lines[0].split(',');
  
  const trips: NotionTrip[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const trip: NotionTrip = {
      name: values[header.indexOf('Name')],
      startDate: values[header.indexOf('Start Date')],
      endDate: values[header.indexOf('End Date')],
      destinations: values[header.indexOf('Destinations')]
        .split('/')  // Notion separa con / o comma
        .map(d => d.trim())
        .filter(d => d.length > 0),
      budget: parseInt(values[header.indexOf('Budget')]) || undefined,
      status: (values[header.indexOf('Status')] || 'completed').toLowerCase() as any,
      notes: values[header.indexOf('Notes')] || undefined,
    };
    
    if (trip.name) trips.push(trip);
  }
  
  return trips;
}
```

### 1.3 Geocoding Destinazioni

Per ogni destinazione testo (es. "Palermo", "Tokyo, Kyoto"), fare geocoding per estrarre:
- Città/paese
- Coordinate (lat, lon) per la mappa
- Country code (per info paese)

**Opzioni geocoding (gratis):**
- **Nominatim** (OpenStreetMap) - free, rate-limited
- **REST Countries API** - per paesi interi
- **Google Maps Geocoding** - free tier limitat, oppure fallback a coordinate stimate

```typescript
async function geocodeDestination(name: string): Promise<{
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}> {
  // Usa Nominatim o REST Countries
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${name}&format=json&limit=1`);
  const data = await response.json();
  
  if (data.length > 0) {
    return {
      city: data[0].name,
      country: data[0].address.country || '',
      countryCode: data[0].address.country_code?.toUpperCase() || '',
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  }
  
  // Fallback: errore o coordinate default
  throw new Error(`Geocoding failed for ${name}`);
}
```

### 1.4 UI Flow Import

**Step 1: Upload**
```
┌─────────────────────────────────────┐
│  Import from Notion                 │
├─────────────────────────────────────┤
│  Drag CSV/JSON here or click        │
│  [Upload File]                      │
└─────────────────────────────────────┘
```

**Step 2: Preview**
```
┌─────────────────────────────────────┐
│  Preview Import (3 viaggi)          │
├─────────────────────────────────────┤
│ ☑ Sicilia (2023-06-01 → 06-15)     │
│ ☑ Giappone (2024-01-10 → 01-25)    │
│ ☑ Londra (2024-03-01 → 03-05)      │
├─────────────────────────────────────┤
│  [Cancel]  [Import Now]             │
└─────────────────────────────────────┘
```

**Step 3: Geocoding Progress**
```
Geocoding destinations...
✓ Sicilia: Palermo, Mondello
✓ Giappone: Tokyo, Kyoto, Osaka
⏳ Londra: Geocoding...
```

**Step 4: Success**
```
┌─────────────────────────────────────┐
│ ✓ Import Successful                 │
│                                     │
│ 3 trips imported:                   │
│ • Sicilia (6 days)                  │
│ • Giappone (15 days)                │
│ • Londra (4 days)                   │
│                                     │
│ Countries discovered: 4              │
│ (Italia, Giappone, UK, Francia)     │
│                                     │
│ [View Dashboard]                    │
└─────────────────────────────────────┘
```

### 1.5 Database Insertion

```typescript
async function importNotionTrips(trips: NotionTrip[], userId: string) {
  const importedTrips = [];
  
  for (const trip of trips) {
    // Geocode destinations
    const geocodedDests = await Promise.all(
      trip.destinations.map(d => geocodeDestination(d))
    );
    
    // Create trip in DB
    const newTrip = await supabase
      .from('trips')
      .insert({
        owner_id: userId,
        name: trip.name,
        start_date: trip.startDate,
        end_date: trip.endDate,
        destinations: geocodedDests, // JSON
        budget_planned: trip.budget,
        archived_at: trip.status === 'archived' ? new Date() : null,
        created_at: new Date(),
      })
      .select()
      .single();
    
    // Populate destination_info for each country (cache)
    for (const dest of geocodedDests) {
      const countryInfo = await fetchCountryInfo(dest.countryCode);
      await supabase
        .from('destination_info')
        .upsert({
          country_code: dest.countryCode,
          city_name: dest.city,
          ...countryInfo,
          cached_at: new Date(),
        });
    }
    
    importedTrips.push(newTrip);
  }
  
  return importedTrips;
}
```

### 1.6 Error Handling

- **File vuoto:** "No trips found in file"
- **Destinazione non trovata:** Skip con warning, o chiedi manuale override
- **Date invalide:** Mostra errore specifico, utente può editare prima di import
- **Duplicate:** Check name + dates, chiedi conferma

---

## 2. Scratch Map Intelligente

### 2.1 Auto-Population da Viaggi

**Al primo caricamento della mappa:**
1. Query DB: tutti i trip dell'utente dove `archived_at IS NULL` (o includi anche archived)
2. Per ogni trip, estrai `destinations` array
3. Raggruppa per country code:
   ```
   {
     IT: [trip1, trip2, trip3],
     JP: [trip4],
     GB: [trip5],
     ES: [trip6, trip7],
   }
   ```
4. Colora paesi in base a count (1=light, 5+=dark)
5. Render mappa con colori

**Database query:**
```typescript
const trips = await supabase
  .from('trips')
  .select('id, name, start_date, end_date, destinations')
  .eq('owner_id', userId)
  .order('start_date', { ascending: false });

// Aggregate by country
const countryMap = new Map<string, Trip[]>();
trips.forEach(trip => {
  trip.destinations.forEach(dest => {
    const code = dest.countryCode;
    if (!countryMap.has(code)) countryMap.set(code, []);
    countryMap.get(code)!.push(trip);
  });
});
```

### 2.2 Interazioni Mappa

#### Click su Paese
```typescript
onCountryClick(countryCode: string) {
  const trips = countryMap.get(countryCode) || [];
  
  showModal({
    title: `${countryName} - ${trips.length} trip(s)`,
    trips: trips.map(t => ({
      name: t.name,
      dates: `${formatDate(t.start_date)} → ${formatDate(t.end_date)}`,
      onClick: () => navigateTo(`/trip/${t.id}`),
    })),
    actions: [
      { label: 'Add Custom Journey', onClick: () => showAddJourneyForm(countryCode) },
      { label: 'Close' },
    ],
  });
}
```

#### Aggiungi Custom Journey (Skeleton)
```
┌──────────────────────────────────┐
│ Add Journey (Skeleton)           │
├──────────────────────────────────┤
│ Trip Name *                      │
│ [Estathé Famiglia 2015     ]     │
│                                  │
│ Start Date *                     │
│ [2015-07-01            ]         │
│                                  │
│ End Date *                       │
│ [2015-08-01            ]         │
│                                  │
│ Destinations (comma-separated) * │
│ [Madrid, Barcelona, Valencia   ] │
│                                  │
│ Notes (opzionale)                │
│ [Estathé in Spagna con famiglia] │
│                                  │
│ [Cancel] [Create]                │
└──────────────────────────────────┘
```

**Logica:**
1. Parse destinations input (split by comma)
2. Geocode each
3. Create trip con `destinations` populated
4. Auto-color mappa

```typescript
async function createSkeletonJourney(formData: {
  name: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  notes?: string;
}) {
  const geocodedDests = await Promise.all(
    formData.destinations.map(d => geocodeDestination(d))
  );
  
  const trip = await supabase
    .from('trips')
    .insert({
      owner_id: userId,
      name: formData.name,
      start_date: formData.startDate,
      end_date: formData.endDate,
      destinations: geocodedDests,
      budget_planned: null, // Skeleton
      created_at: new Date(),
    })
    .select()
    .single();
  
  // Refresh mappa
  refreshScratchMap();
}
```

### 2.3 Drag-to-Paint Multi-Select

**UX:**
1. Modalità "Paint mode" - toggle button
2. Mouse down su paese → start selection
3. Drag over altri paesi → add to selection
4. Mouse up → bulk action menu:
   - "Mark all as visited"
   - "Create journey from these" (form con date)
   - "Cancel"

```typescript
const [paintMode, setPaintMode] = useState(false);
const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

onCountryMouseEnter(code: string) {
  if (paintMode && isMouseDown) {
    setSelectedCountries(prev => [...new Set([...prev, code])]);
  }
}

onMouseUp() {
  if (selectedCountries.length > 0) {
    showBulkActionMenu(selectedCountries);
  }
}
```

### 2.4 Visualizzazione Opzioni

- **Checkbox "Show Routes"**: Disegna linee fra paesi ordine cronologico
  ```
  trip1: IT → FR → ES
  trip2: GB → FR → NL
  Mappa mostra linee fra città nella sequenza di trip
  ```

- **Checkbox "Show Labels"**: Mostra nome paese su hover o sempre
  
- **Heatmap Legend**:
  ```
  ▢ Not visited
  ▨ 1 trip
  ▨ 2-4 trips
  ▨ 5+ trips
  ```

### 2.5 Export Functions

```typescript
// Export PNG
async function exportMapPNG() {
  const canvas = await html2canvas(mapElement);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `JourneyAtlas_${new Date().toISOString().split('T')[0]}.png`;
  link.click();
}

// Export CSV
function exportCountriesCSV() {
  const rows = Array.from(countryMap.entries()).map(([code, trips]) => ({
    country: getCountryName(code),
    visits: trips.length,
    lastVisit: trips[0].end_date,
    journeys: trips.map(t => t.name).join(' | '),
  }));
  
  const csv = convertToCSV(rows);
  downloadCSV(csv, 'JourneyAtlas_Countries.csv');
}
```

### 2.6 Share Public Link (Optional)

```typescript
async function generateShareLink() {
  const shareToken = generateRandomToken();
  
  await supabase
    .from('share_links')
    .insert({
      user_id: userId,
      token: shareToken,
      type: 'scratch_map',
      created_at: new Date(),
    });
  
  return `https://journeyatlas.com/shared/${shareToken}`;
}
```

---

## 3. Technical Implementation Details

### 3.1 Libraries Needed

```bash
npm install papaparse csv-parse
npm install leaflet react-leaflet
npm install nominatim-geolocation  # or use raw fetch
npm install html2canvas jspdf  # for export
```

### 3.2 DB Schema Updates (Notion Import)

Aggiungere tabella per tracking import:
```sql
CREATE TABLE import_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  import_source VARCHAR (50), -- 'notion', 'manual'
  trips_count INT,
  imported_at TIMESTAMP,
  status VARCHAR(20), -- 'success', 'partial', 'failed'
  error_message TEXT,
);
```

### 3.3 Performance Considerations

- **Mappa:** Leaflet è lightweight, renderizza in modo lazy
- **Geocoding:** Cache risultati in DB per 30 giorni
- **Country Aggregation:** Fatto in memoria (è un Map, veloce)
- **CSV parse:** file < 10MB assumed, ok on client side

### 3.4 Error Recovery

Se geocoding fallisce su un paese:
1. Log warning
2. Mostra "⚠ Londra couldn't be found, manually confirm"
3. Mappa mostra country "unknown"
4. Utente può editare trip in detail, fissare manualmente

---

## 4. Roadmap Integration

**Fase 1 (MVP):**
- ✓ Import Notion CSV/JSON basic parser
- ✓ Preview + bulk import UI
- ✓ Skeleton journey fallback (form manuale)

**Fase 5 (Analytics):**
- ✓ Scratch map con auto-population
- ✓ Click paese → list journeys
- ✓ Custom journey skeleton
- ✓ Paint mode + bulk actions
- ✓ Export PNG/CSV
- ✓ Share link (opzionale)

---

## 5. Example Flow - User Story

**Marco ha 20 viaggi tracciati in Notion. Vuole migrarli a JourneyAtlas:**

1. Apre Notion, esporta "Viaggi" come CSV
2. Va su JourneyAtlas → Settings → "Import from Notion"
3. Upload file CSV
4. Vede preview: "20 trips, 15 countries found"
5. Click "Import" → waiting screen con progress
6. ✓ Success: "20 trips imported, 15 countries discovered"
7. Apre Dashboard → vede tutti i viaggi
8. Apre "Scratch Map" → mappa pre-colorata con tutti i paesi visitati
9. Hover over Italia → vede "5 journeys" (Sicilia, Roma, Firenze, Venezia, Milano)
10. Click "Add Custom Journey" → aggiunge "Estathé 2015 Spagna" che non aveva tracciato
11. Mappa si aggiorna automaticamente
12. Export mappa come PNG per condividere su Instagram

---

## 6. Scratch Map - Dual View Implementation (Globo 3D + Mappa Piatta)

### 6.1 Architettura Dual-View

```
┌────────────────────────────────────┐
│  Scratch Map Component             │
├────────────────────────────────────┤
│ [3D Globe] [Flat Map] ← Toggle     │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐   │
│ │ View A: 3D Globo (Cobe)      │   │ ← Visible
│ │ ┌──────────────────────────┐ │   │
│ │ │    [Mundo rotante]       │ │   │
│ │ │ Paesi colorati per visite│ │   │
│ │ └──────────────────────────┘ │   │
│ └──────────────────────────────┘   │
│                                     │
│ ┌──────────────────────────────┐   │
│ │ View B: Mappa Piatta (Leaflet)   │ ← Hidden (render on demand)
│ │ ┌──────────────────────────┐ │   │
│ │ │  [Mappa Mercatore]       │ │   │
│ │ │ Zoom: paese→regione      │ │   │
│ │ └──────────────────────────┘ │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### 6.2 GeoJSON Data Structure

**Origine dati:**
```
Natural Earth: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
  → countries.geojson (paesi mondo)
  → admin_1_states_provinces.geojson (regioni)

world-geojson GitHub: https://github.com/georgique/world-geojson
  → /countries/usa.json (paesi)
  → /states/usa/*.json (stati USA)
  → /territories/usa/*.json (territori USA)
```

**Schema GeoJSON unified - Esempio regione standard:**
```json
{
  "type": "Feature",
  "properties": {
    "name": "California",
    "level": 1,
    "type": "state",
    "country": "USA",
    "code": "CA",
    "visited": true,
    "visits": 3,
    "lastVisit": "2024-09-15",
    "recognition": "fully_recognized"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lon, lat]]]
  }
}
```

**Schema GeoJSON - De facto state (es. Northern Cyprus):**
```json
{
  "type": "Feature",
  "properties": {
    "name": "Northern Cyprus",
    "level": 1,
    "type": "de_facto_state",
    "country": "Cyprus",
    "parent": "Cyprus",
    "code": "TRNC",
    "visited": true,
    "visits": 2,
    "lastVisit": "2024-08-20",
    "recognition": "limited_recognized",
    "recognized_by": ["Turkey"],
    "note": "Turkish Republic of Northern Cyprus - Recognized only by Turkey"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lon, lat]]]
  }
}
```

**Dataset sources:**
- Natural Earth: https://www.naturalearthdata.com/ (paesi, regioni, layer "disputed")
- Wikipedia: https://en.wikipedia.org/wiki/List_of_states_with_limited_recognition (list de facto states)
- world-geojson: https://github.com/georgique/world-geojson (USA states + territories)

### 6.3 React Component Implementation

**Hook principale - useScratchMap:**
```typescript
export function useScratchMap(userId: string) {
  const [viewMode, setViewMode] = useState<'globe' | 'map'>('globe');
  const [visitedRegions, setVisitedRegions] = useState<Map<string, RegionData>>(new Map());
  const [geojsonCache, setGeojsonCache] = useState<GeoJSON.FeatureCollection | null>(null);
  
  // Carica visitedRegions da DB
  useEffect(() => {
    async function loadVisitedRegions() {
      const trips = await fetchTripsForUser(userId);
      const regions = aggregateRegionsFromTrips(trips);
      setVisitedRegions(regions);
    }
    loadVisitedRegions();
  }, [userId]);
  
  // Carica GeoJSON da CDN (o localStorage)
  useEffect(() => {
    async function loadGeoJSON() {
      const cached = localStorage.getItem('geojson_world');
      if (cached) {
        setGeojsonCache(JSON.parse(cached));
      } else {
        const response = await fetch('https://unpkg.com/world-geojson@3.0.0/countries.geojson');
        const data = await response.json();
        localStorage.setItem('geojson_world', JSON.stringify(data));
        setGeojsonCache(data);
      }
    }
    loadGeoJSON();
  }, []);
  
  const getRegionColor = (regionName: string): string => {
    const visits = visitedRegions.get(regionName)?.visits || 0;
    if (visits === 0) return '#E5E7EB'; // gray - unvisited
    if (visits === 1) return '#FED7AA'; // light gold
    if (visits <= 4) return '#FCD34D'; // medium gold
    return '#D4AF37'; // deep gold
  };
  
  return {
    viewMode,
    setViewMode,
    visitedRegions,
    geojsonCache,
    getRegionColor,
  };
}
```

**Component render:**
```typescript
export function ScratchMapView({ userId }: { userId: string }) {
  const {
    viewMode,
    setViewMode,
    visitedRegions,
    geojsonCache,
    getRegionColor,
  } = useScratchMap(userId);

  return (
    <div className="w-full h-screen bg-cream dark:bg-dark-navy relative">
      {/* Toggle buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setViewMode('globe')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            viewMode === 'globe'
              ? 'bg-gold text-deep-blue'
              : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          🌍 3D Globe
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            viewMode === 'map'
              ? 'bg-gold text-deep-blue'
              : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          🗺️ Flat Map
        </button>
      </div>

      {/* 3D Globe - Cobe */}
      {viewMode === 'globe' && (
        <CobeGlobeView
          visitedRegions={visitedRegions}
          getRegionColor={getRegionColor}
        />
      )}

      {/* Flat Map - Leaflet */}
      {viewMode === 'map' && (
        <LeafletMapView
          geojsonCache={geojsonCache}
          visitedRegions={visitedRegions}
          getRegionColor={getRegionColor}
        />
      )}

      {/* Statistics Widget */}
      <StatsWidget visitedRegions={visitedRegions} className="absolute bottom-4 right-4" />
    </div>
  );
}
```

### 6.3b Drill-Down with Recognition Status (De Facto States)

**Quando utente clicca su regione contestata (es. Cipro Nord):**

```typescript
function showDrillDownModal(region: GeoJSONFeature) {
  const { name, parent, recognition, recognized_by, note } = region.properties;
  
  return (
    <Modal>
      <h2>{name}</h2>
      
      {/* Recognition badge */}
      {recognition === 'limited_recognized' && (
        <Alert type="info">
          <span className="font-semibold">⚠️ Limited Recognition</span>
          <p>Recognized by: {recognized_by.join(', ')}</p>
          <p className="text-xs">{note}</p>
        </Alert>
      )}
      
      {/* List of trips in this region */}
      <div>
        <h3>Journeys in {name}</h3>
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} onClick={() => enterTrip(trip.id)} />
        ))}
      </div>
      
      {/* If parent exists, show both */}
      {parent && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-slate-600">
            {name} is administered as part of <strong>{parent}</strong>
          </p>
        </div>
      )}
    </Modal>
  );
}
```

**Esempio in UI - Cyprus:**
```
┌─────────────────────────────────────┐
│ Cyprus                              │
├─────────────────────────────────────┤
│ ✅ Fully Recognized                  │
│ Government of Cyprus (ROC)           │
│                                     │
│ Journeys (3):                       │
│ • Paphos 2023 (5 days)             │
│ • Larnaca 2022 (3 days)            │
│ • Nicosia 2024 (2 days)            │
│                                     │
│ ─────────────────────────────────  │
│ ⚠️ LIMITED RECOGNITION              │
│ Northern Cyprus                      │
│ Recognized by: Turkey only           │
│ Turkish Republic of Northern Cyprus  │
│                                     │
│ Journeys (1):                       │
│ • Kyrenia 2024 (4 days)            │
│ • Famagusta 2024 (3 days)          │
│                                     │
│ [Learn more] [View Trips]           │
└─────────────────────────────────────┘
```

### 6.4 Cobe 3D Globe Implementation

```typescript
import { CobeLayers } from 'cobe';

export function CobeGlobeView({ visitedRegions, getRegionColor }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    const render = (time: number) => {
      phi += 0.002; // Auto-rotation
      
      // Render globe...
      // Applica colori da getRegionColor() per ogni paese
    };

    const animate = () => {
      render(Date.now());
      requestAnimationFrame(animate);
    };
    animate();
  }, [visitedRegions]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onClick={(e) => {
        // Detect clicked country → drill-down
        const country = getCountryAtClick(e);
        showTripList(country);
      }}
    />
  );
}
```

### 6.5 Leaflet Flat Map Implementation

```typescript
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';

export function LeafletMapView({ geojsonCache, visitedRegions, getRegionColor }) {
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const regionName = feature.properties.name;
    const color = getRegionColor(regionName);
    
    // Apply color to layer
    if (layer instanceof L.Path) {
      layer.setStyle({ fillColor: color, color: '#333' });
    }

    // Click handler
    layer.on('click', () => {
      const trips = visitedRegions.get(regionName)?.trips || [];
      showTripListModal(regionName, trips);
    });
  };

  return (
    <MapContainer center={[20, 0]} zoom={2} className="w-full h-full">
      <TileLayer
        url={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
        attribution="© OpenStreetMap"
      />
      {geojsonCache && (
        <GeoJSON data={geojsonCache} onEachFeature={onEachFeature} />
      )}
    </MapContainer>
  );
}
```

### 6.6 Export PNG Implementation

```typescript
import html2canvas from 'html2canvas';

async function exportMapAsImage(format: '3d' | 'flat' | 'both') {
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === '3d' || format === 'both') {
    const canvas = canvasRef.current; // da Cobe
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `JourneyAtlas_Globe_${timestamp}.png`;
    link.click();
  }

  if (format === 'flat' || format === 'both') {
    const mapElement = document.querySelector('.leaflet-container');
    const canvas = await html2canvas(mapElement);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `JourneyAtlas_Map_${timestamp}.png`;
    link.click();
  }
}
```

### 6.7 Performance Optimization

**Rendering optimization:**
```typescript
// Carica GeoJSON solo quando serve
const [isMapVisible, setIsMapVisible] = useState(false);

useEffect(() => {
  if (viewMode === 'map' && !isMapVisible) {
    setIsMapVisible(true);
  }
}, [viewMode]);

// Render Leaflet map solo se visible
{isMapVisible && <LeafletMapView ... />}
```

**Color memoization:**
```typescript
const colorMap = useMemo(() => {
  const colors = new Map<string, string>();
  visitedRegions.forEach((data, region) => {
    colors.set(region, getRegionColor(region));
  });
  return colors;
}, [visitedRegions, getRegionColor]);
```

---

**Fine documento. Pronto per fase implementazione!**
