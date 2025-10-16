# MJD-FootballScout

A full-stack application for searching, collecting, and managing football player data.  
The backend crawls/parses public web sources (Cheerio) and provides a REST API.  
The web app (Next.js) and the mobile app (Expo/React Native) consume this API, including login (credentials & Google), session handling, and player management.

## Table of Contents
- Overview & Architecture
- Tech Stack
- Project Structure
- Prerequisites
- Quick Start
- Environment Variables (.env examples)
- Scripts & Development
- API Overview
- Deployment Notes
- Troubleshooting
- License

## Overview & Architecture
- **Backend (server):** Express/TypeScript, MongoDB, Cheerio. Endpoints for authentication, player search, CRUD, and bulk updates. JWT (Access/Refresh) for API access.
- **Web App (web-app):** Next.js 15 (App Router), NextAuth (Credentials + Google), React Query, TailwindCSS, Axios. Consumes the backend REST API.
- **Mobile App (mobile-app):** Expo/React Native (Router). Uses the same REST API; status may vary (work in progress).

## Tech Stack
- **Language:** TypeScript
- **Backend:** Node.js, Express 5, MongoDB/Mongoose, Cheerio, Zod, Helmet, CORS, Compression, Winston
- **Auth:** JWT (Server), NextAuth (Web, Credentials + Google OAuth)
- **Web:** Next.js 15, React 19, @tanstack/react-query, TailwindCSS 4, NextAuth, axios
- **Mobile:** Expo 53, React Native 0.79, expo-router
- **Build/Tools:** tsx, esbuild, pnpm/npm, dotenv

## Project Structure
- **server** – Express backend (entry: `src/index.ts`, `/routes`, `/controllers`, `/models`)
- **web-app** – Next.js frontend (App Router, NextAuth, hooks, components)
- **mobile-app** – Expo/React Native app

## Prerequisites
- Node.js >= 20
- Package manager: pnpm recommended (npm as alternative)
- MongoDB database (e.g., MongoDB Atlas)
- Google OAuth client (for web login with Google)

## Quick Start
1. Clone the repository
2. Install dependencies:
    - Backend: `cd server && npm install` (or `pnpm install`)
    - Web App: `cd web-app && pnpm install` (or `npm install`)
    - Mobile App: `cd mobile-app && npm install`
3. Create `.env` files (see below)
4. Start development:
    - Backend: `npm run dev` (default port 8080)
    - Web App: `pnpm dev` (default: http://localhost:3000)
    - Mobile App: `npm start` (Expo)

## Environment Variables (.env examples)

**Backend (server/.env):**
```
PORT=8080
MONGOURI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=a_long_secure_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Web App (web-app/.env.local):**
```
NEXT_PUBLIC_API_HOST=http://localhost:8080
API_HOST=http://localhost:8080
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXTAUTH_SECRET=a_long_secure_secret
```

Notes:
- `NEXT_PUBLIC_API_HOST` is used in the browser (axios baseURL) and must be publicly accessible.
- `API_HOST` is used server-side.
- For Google login, you need an OAuth client in Google Cloud Console (Web). The NextAuth callback URL follows the NextAuth standard (e.g., http://localhost:3000/api/auth/callback/google).

## Scripts & Development

**Backend (server/package.json):**
- `dev`: tsx watch src/index.ts
- `build`: esbuild src/index.ts …
- `start`: node dist/index.js

**Web App (web-app/package.json):**
- `dev`: next dev --turbopack
- `build`: next build
- `start`: next start
- `lint`: next lint

**Mobile App (mobile-app/package.json):**
- `start`: expo start
- `android`: expo start --android
- `ios`: expo start --ios
- `web`: expo start --web

## API Overview (Backend)
**Base URL:** http://localhost:8080

**Public:**
- `POST /search` – Body: `{ name: string }` → list of matching players
- `POST /auth/register` – Register new user
- `POST /auth/login` – Login with email/password
- `POST /auth/google-login` – Login/Signup via Google email
- `POST /auth/refresh` – Refresh access token (Body: `{ refreshToken }`)

**Authenticated (Authorization: Bearer <accessToken>):**
- `GET /players` – Get all players
- `POST /players` – Save player (Body: `{ data: … }`)
- `GET /players/:id` – Get player by ID
- `PUT /players/:id` – Update player from websites
- `DELETE /players/:id` – Delete player
- `PUT /update-players` – Bulk update all players

CORS: In development `origin=*`, in production `CLIENT_URL` must be set.

## Deployment Notes
- **Server:** Set secure environment variables (MONGOURI, JWT_SECRET, CLIENT_URL, PORT). Enable HTTPS at ingress/proxy.
- **Web App:** Set `NEXT_PUBLIC_API_HOST` to public API URL. Securely store `NEXTAUTH_SECRET` and Google OAuth credentials.
- **MongoDB:** Configure IP whitelisting/network rules correctly.

## Troubleshooting
- **401/403 from backend:** Check Authorization header (Bearer access token) and token validity. The web app automatically logs out and redirects to `/login` on 401.
- **Token refresh errors:** Ensure `/auth/refresh` is reachable and `JWT_SECRET` matches on both server and NextAuth side.
- **CORS issues:** In production, make sure `CLIENT_URL` is set correctly; in dev everything is allowed.
- **Google login fails:** Verify redirect URIs in Google Console; check `.env` values (`GOOGLE_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET`).
- **DB connection issues:** Check `MONGOURI` and MongoDB Atlas network access.
  