# ✈️ JourneyAtlas

Travel planning & expense sharing app — pianificazione collaborativa dei viaggi, condivisione spese, packing list, info paese e mappa dei posti visitati.

Questo repository contiene al momento il **setup iniziale del progetto**: struttura cartelle, scaffolding frontend/backend e specifiche. L'implementazione delle funzionalità segue le fasi descritte in [`specifiche/TRAVEL_APP_PHASES.md`](specifiche/TRAVEL_APP_PHASES.md).

## Struttura del repository

```
journeyatlas/
├── specifiche/       # Documentazione di progetto (spec, fasi, design system, guide)
├── frontend/         # React 18 + TypeScript + Vite + Tailwind CSS
└── backend/          # C# ASP.NET Core (Minimal API, .NET 8)
```

## 📖 Documentazione

Parti da [`specifiche/README_FILES_GUIDE.md`](specifiche/README_FILES_GUIDE.md) per una guida rapida ai documenti di progetto:

- [`TRAVEL_APP_SPEC.md`](specifiche/TRAVEL_APP_SPEC.md) — specifica tecnica e funzionale completa
- [`TRAVEL_APP_PHASES.md`](specifiche/TRAVEL_APP_PHASES.md) — roadmap in 5 fasi
- [`DESIGN_SYSTEM.md`](specifiche/DESIGN_SYSTEM.md) — Tailwind config, palette, componenti React
- [`NOTION_IMPORT_AND_SCRATCHMAP.md`](specifiche/NOTION_IMPORT_AND_SCRATCHMAP.md) — import Notion e scratch map

## 🏗️ Stack tecnologico

| Layer      | Tecnologia |
|------------|------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS + i18next |
| Backend    | C# ASP.NET Core (Minimal APIs, .NET 8) |
| Database   | Supabase (PostgreSQL) — da configurare |
| Auth       | Supabase Auth (email/password + OAuth) — da configurare |

## 🚀 Avvio in locale

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend/JourneyAtlas.Api
dotnet run
```

L'health check è disponibile su `GET /health`; in sviluppo Swagger UI è su `/swagger`.

## Stato del progetto

- [x] Setup repository e struttura cartelle
- [x] Scaffolding frontend (Vite + React + TS + Tailwind + i18n + componenti base)
- [x] Scaffolding backend (ASP.NET Core Minimal API + CORS + health check)
- [ ] Configurazione Supabase (DB + Auth + Storage)
- [ ] Fase 1 — vedi `specifiche/TRAVEL_APP_PHASES.md`
