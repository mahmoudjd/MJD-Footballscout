# MJD Football Scout Backend

REST API fuer Spielerverwaltung, Authentifizierung, Watchlists, Vergleich und Scouting-Reports.

## Stack
- Node.js + TypeScript + Express
- MongoDB (native driver)
- Zod (Input-Validierung)
- JWT (Access/Refresh Tokens)
- Winston (Logging)

## Kernfunktionen
- Spielerlisten, Statistiken, Highlights, Advanced Search
- Auth mit E-Mail/Passwort und Google Login
- Rollenmodell (`admin`, `user`)
- Geschuetzte Bereiche: Profil, Compare, Reports, Watchlists
- Admin-only Loeschen von Spielern

## Rollen & Zugriff
- `public`: Search, Player-Liste, Stats, Highlights, Advanced
- `authenticated (user/admin)`: Compare, Player-Detail, History, Reports, Watchlists
- `admin`: `DELETE /players/:id`

## Voraussetzungen
- Node.js 20+ (empfohlen: 24)
- MongoDB (lokal oder remote)
- npm oder pnpm

## Installation
```bash
cd server
npm install
```

## Umgebungsvariablen
Datei: `server/.env`

```env
NODE_ENV=local
PORT=8080
MONGOURI=mongodb://127.0.0.1:27017/PlayersDB
JWT_SECRET=replace-with-a-long-random-secret
# optional fuer Production CORS
CLIENT_URL=http://localhost:3000
# optional: auto-update all players in background
PLAYERS_AUTO_UPDATE_ENABLED=true
PLAYERS_AUTO_UPDATE_INTERVAL_HOURS=12
PLAYERS_AUTO_UPDATE_RUN_ON_STARTUP=false
```

Hinweis: Im Code wird `MONGOURI` verwendet (nicht `MONGO_URI`).

### Scheduler fuer automatische Player-Updates
- Der Backend-Prozess kann `updateAllPlayers` automatisch im Hintergrund ausfuehren.
- Standard-Intervall: alle `12` Stunden.
- Der Job macht nur das Player-Update (keine anderen Aufgaben).
- Steuerung ueber ENV:
  - `PLAYERS_AUTO_UPDATE_ENABLED` (default: `true`)
  - `PLAYERS_AUTO_UPDATE_INTERVAL_HOURS` (default: `12`)
  - `PLAYERS_AUTO_UPDATE_RUN_ON_STARTUP` (default: `false`)

## Scripts
```bash
npm run dev    # tsx watch src/index.ts
npm run build  # esbuild -> dist/index.js
npm start      # node dist/index.js
```

## Lokaler Start
```bash
npm run dev
```
Server laeuft standardmaessig auf `http://localhost:8080`.

## API Uebersicht
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google-login`
- `POST /auth/refresh`

### Auth Flow (3 Cases: Credentials + Google)
1. Case 1: User registriert mit Credentials und loggt sich spaeter mit Google ein
   Voraussetzung: Google-E-Mail ist verifiziert und gleich wie beim Credentials-Account.
   Ergebnis: `POST /auth/google-login` liefert `200` und verknuepft `googleId` mit dem bestehenden User.

2. Case 2: Neuer User loggt sich direkt mit Google ein
   Voraussetzung: Google-E-Mail ist verifiziert.
   Ergebnis: `POST /auth/google-login` erstellt einen neuen Google-User und liefert `200`.

3. Case 3: Konfliktfall (E-Mail bereits mit anderem Google-Account verknuepft)
   Voraussetzung: Die E-Mail existiert schon mit einer anderen `googleId`.
   Ergebnis: `POST /auth/google-login` liefert `409` mit:
   `"This email is already linked to another Google account."`

### Players
- `GET /players`
- `GET /players/stats`
- `GET /players/highlights`
- `GET /players/advanced`
- `GET /players/compare` (auth)
- `GET /players/:id` (auth)
- `GET /players/:id/history` (auth)
- `POST /players` (auth)
- `PUT /players/:id` (auth)
- `DELETE /players/:id` (admin)
- `PUT /update-players` (auth)
- `POST /search` (public)

### Scouting Reports
- `GET /players/:id/reports` (auth)
- `POST /players/:id/reports` (auth)
- `PUT /reports/:reportId` (auth)
- `DELETE /reports/:reportId` (auth)

### Watchlists (alle auth)
Basis: `/watchlists`
- `GET /`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `POST /:id/players`
- `DELETE /:id/players/:playerId`
- `PUT /:id/players/reorder`

## Auth Header
Bei geschuetzten Routen:
```http
Authorization: Bearer <access_token>
```

## Docker
```bash
cd server
docker build -t mjd-football-scout-backend .
docker run --env-file .env -p 8080:8080 mjd-football-scout-backend
```

## Troubleshooting
- `esbuild: command not found`: zuerst `npm install` im `server` ausfuehren.
- `Invalid token type`: es wird ein Refresh Token statt Access Token genutzt.
- CORS Fehler in Production: `CLIENT_URL` korrekt setzen.
