# MJD Football Scout Web App

Next.js Frontend fuer die Football-Scout Plattform mit Suche, Vergleich, Profilen und Watchlists.

## Stack

- Next.js (App Router)
- React + TypeScript
- NextAuth (Credentials + Google)
- TanStack Query
- Axios

## Features

- Oeffentliche Suche (`/search`) und Spielerlisten (`/players`)
- Advanced Search (`/advanced-search`)
- Compare (`/compare`) fuer eingeloggte Nutzer
- Spielerprofil (`/players/[playerId]`) nur fuer eingeloggte Nutzer
- Watchlists (`/watchlists`) nur fuer eingeloggte Nutzer
- Rollenbasierte UI (Delete nur fuer `admin` sichtbar/aktiv)

## Voraussetzungen

- Node.js 20+ (empfohlen: 24)
- laufendes Backend (`NEXT_PUBLIC_API_HOST`)

## Installation

```bash
cd web-app
npm install
```

## Umgebungsvariablen

Datei: `web-app/.env.local`

```env
NEXT_PUBLIC_API_HOST=http://localhost:8080
NEXTAUTH_SECRET=replace-with-a-long-random-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# optional empfohlen fuer Deployments
NEXTAUTH_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Lokaler Start

1. Backend starten (`server`, Port `8080`)
2. Frontend starten:

```bash
npm run dev
```

3. App oeffnen: `http://localhost:3000`

## Auth & Zugriff

- `public`: Home, Players, Search, Advanced Search
- `authenticated`: Compare, Player Profile, Watchlists
- `admin`: Delete Action in Player-Listen

## Projektstruktur (relevant)

- `src/app` Routen (App Router)
- `src/components` UI und Feature-Komponenten
- `src/lib/hooks` API-Queries/Mutations
- `src/auth.ts` NextAuth Konfiguration
- `src/env.ts` Runtime Env-Validierung (zod)

## Hinweise

- Wenn Compare/Profile/Watchlists ohne Login geoeffnet werden, fuehrt die App zum Login.
- Nach Login wird per `callbackUrl` zur angefragten Seite zuruecknavigiert.

## Troubleshooting

- `next: command not found`: `npm install` in `web-app` ausfuehren.
- `NEXT_PUBLIC_API_HOST muss eine gueltige URL sein`: `.env.local` pruefen.
- 401 bei geschuetzten Seiten: Session abgelaufen, neu einloggen.
