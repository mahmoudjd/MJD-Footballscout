# MJD Football Scout Mobile App

React Native (Expo) client for players, search, compare, watchlists, and scouting profile views.

## Stack

- Expo Router
- React Native + TypeScript
- Custom JWT auth (email/password + Google ID token)
- Role-aware UI (`admin`, `user`)

## Features

- Home live insights
- Players list with filters, sorting, pagination, and admin update-all action
- Search (local + backend), then save player to list
- Compare (selection/all players) with ranking table
- Watchlists (create/edit/delete, add/remove/reorder players)
- Player profile (auth required) with scouting reports and history
- Reusable in-app feature guides (`Players`, `Search`, `Compare`, `Watchlists`)

## Install & Run

```bash
cd mobile-app
npm install
npx expo start
```

Native build:

```bash
npx expo run:ios
npx expo run:android
```

## Required Environment

File: `mobile-app/.env`

```env
EXPO_PUBLIC_API_URL=https://mjd-football-server.onrender.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=yyy.apps.googleusercontent.com
# optional override, usually leave empty
# EXPO_PUBLIC_GOOGLE_REDIRECT_URI=com.googleusercontent.apps.xxx:/oauthredirect
```

## Google Login Setup (Correct Way)

1. In Google Cloud Console, create OAuth clients:
   - `iOS` client for bundle id `mjd.football.de`
   - `Android` client for package `mjd.football.de` (+ SHA-1)
2. Put both client IDs in `mobile-app/.env` as shown above.
3. In backend `server/.env`, set accepted audiences:
   - `GOOGLE_CLIENT_ID=<ios-client-id>,<android-client-id>`
4. Ensure deep-link schemes are registered in `mobile-app/app.json`:
   - Keep your app scheme (`mjd-football-scout`)
   - Add Google reverse schemes if needed:
     - `com.googleusercontent.apps.<ios-client-id-without-suffix>`
     - `com.googleusercontent.apps.<android-client-id-without-suffix>`
5. Rebuild native app after env/config changes:
   - `npx expo run:ios` or `npx expo run:android`

## Notes on Google Errors

- `400 invalid_request` usually means wrong `client_id` or `redirect_uri`.
- If value starts with `GOCSPX-`, you used a **client secret**, not client ID.
- Server `GOOGLE_CLIENT_ID` must include the same audience as token `aud`.

## Access Rules (aligned with Web App)

- Public: home, player list, search
- Auth required: compare, watchlists, profile
- Admin only: delete player, update all players
