# Mobile: persistent bottom tab bar on all content pages

Date: 2026-07-27
Scope: `mobile-app/` (Expo Router + `expo-router/unstable-native-tabs`)

## Goal

Keep the native bottom tab bar visible on **every content page** — most importantly the
player-detail screen and the secondary tools (Compare, Recruitment, Watchlists, Help,
Profile, Settings) that today are pushed at the root and therefore lose the bar.

Approach chosen by the user: **B — keep the OS-native tab bar**, nest routes inside the
tabs so pushes stay within a tab's stack and the bar persists. (A custom JS bar was the
alternative; rejected to preserve the real Liquid-Glass / Material bar.)

Auth screens (login/signup/forgot/reset/verify) intentionally stay **without** the bar —
they are on-demand gated interruptions; keeping the bar would let a half-registered user
tap a tab and abandon the flow.

## Root cause (why the bar disappears today)

Native tab bars are rendered by the OS tab controller for the `(tabs)` group only. Any
screen pushed at the **root** Stack (a sibling of `(tabs)`) renders *above* that controller
→ no bar. The codebase currently authors screens under `(tabs)/…` but **re-exports them at
the root** to actually render them there:

- `app/[_id].tsx` → re-exports `(tabs)/player/[id]` (the real player-detail screen)
- `app/login.tsx`, `signup.tsx`, … → re-export `(tabs)/auth/*`
- `app/compare.tsx`, `recruitment.tsx`, `watchlists-screen.tsx`, `help.tsx`, `profile.tsx`,
  `settings.tsx` → root Stack screens

Every player link uses absolute `href={`/${id}`}` → resolves to root `[_id]` → bar lost.
`settings` uses `presentation: "modal"` → modals also cover the native bar.

## Target route structure

Convert the content tabs to **named folders with a nested `Stack`** so the primary screen
and its detail/sub-screens live inside the same tab:

```
(tabs)/_layout.tsx                 NativeTabs (triggers: index, search, playerList, shadow-team, account)
(tabs)/index/_layout.tsx           Stack  (Home)
(tabs)/index/index.tsx             Home            (moved from (tabs)/index.tsx)
(tabs)/index/[id].tsx              → re-export shared PlayerDetailScreen
(tabs)/search/_layout.tsx          Stack  (Search)
(tabs)/search/index.tsx            Search          (moved from (tabs)/search.tsx)
(tabs)/search/[id].tsx             → re-export shared PlayerDetailScreen
(tabs)/playerList/_layout.tsx      Stack  (Players)
(tabs)/playerList/index.tsx        Players         (moved from (tabs)/playerList.tsx)
(tabs)/playerList/[id].tsx         → re-export shared PlayerDetailScreen
(tabs)/shadow-team.tsx             Squad — stays a single screen (never opens detail)
(tabs)/account/_layout.tsx         Stack  (More)
(tabs)/account/index.tsx           Settings        (moved from app/settings.tsx)
(tabs)/account/compare.tsx         Compare         (moved from app/compare.tsx)
(tabs)/account/recruitment.tsx     Recruitment
(tabs)/account/watchlists.tsx      Watchlists
(tabs)/account/help.tsx            Help
(tabs)/account/profile.tsx         Profile
```

Root Stack (`app/_layout.tsx`) keeps ONLY: `(tabs)` + the auth screens (no bar, headerShown
false). All the `app/compare.tsx` / `recruitment.tsx` / `watchlists-screen.tsx` / `help.tsx`
/ `profile.tsx` / `settings.tsx` root screens are **removed** (moved into `account/`).

Folder named `index` for the Home tab resolves to `/`; its `[id]` child resolves to `/[id]`.

## Shared player-detail (no duplicated component)

Move the real screen body to `src/screens/PlayerDetailScreen.tsx` (folder already exists).
Each tab's `[id].tsx` is a one-line `export { default } from "@/src/screens/PlayerDetailScreen"`
— same re-export pattern already used by `account.tsx`. Delete `app/[_id].tsx` and the old
`(tabs)/player/[id].tsx`.

## Navigation: one link that stays in the current tab

Player links must push within whichever tab renders them (Home / Search / Players), not jump
to root. Primary approach: **relative navigation** from the list items so the same component
works in every tab:

- `components/PlayerItem.tsx` — `href={`/${player._id}`}` → relative
- `components/home/PlayerSpotlightList.tsx` — same
- `components/PlayerProfile.tsx:743` (similar-players link inside a profile) — same

<!-- ponytail: relative-link resolution across nested stacks is the one fragile spot.
     Ceiling: if relative hrefs resolve wrong from a detail screen, add a tiny
     usePlayerHref() helper that builds `/${segment}/${id}` from the current tab segment.
     Resolve by live-testing in the iOS simulator, not by guessing. -->

## String updates (hardcoded route paths)

These must be updated to the new structure and verified:

- `app/settings.tsx`: `href` list → `compare`/`recruitment`/`watchlists`/`help` now live under
  `account/`; `router.push("/profile")` → account/profile; `callbackUrl: "/(tabs)/account"`.
- `app/help.tsx`: `href: "/(tabs)/playerList"`, `/compare`, `/watchlists-screen`, `/recruitment`.
- `(tabs)/player/[id].tsx` (moving to screens): `router.replace("/(tabs)/playerList")`.
- `(tabs)/search.tsx`, `screens/ShadowTeamScreen.tsx`, `screens/RecruitmentScreen.tsx`:
  `callbackUrl` values (`/search`, `/shadow-team`, `/recruitment`).
- Auth back-links keep working (auth stays at root; `/login`, `/signup`, `/forgot-password`).
- Keep `initialRouteName: "(tabs)"`.

## Header consistency

Each nested `Stack` sets one `screenOptions` block (tint / background / no shadow) sourced
from `Colors[isDark ? "dark" : "light"]`, replacing the repeated per-screen `headerStyle`
copy-paste that lives in `app/_layout.tsx` today. Settings loses `presentation: "modal"` and
becomes the `account` tab's index (a normal screen, so the bar shows).

## Tab bar itself

No change to the 5 destinations, order, icons, or labels: Home · Search · Players · Squad ·
More is sound. `(tabs)/_layout.tsx` trigger `name`s update to match the new folder names
(`index`, `search`, `playerList`, `shadow-team`, `account`) — mostly unchanged.

## Non-goals

- No custom/JS tab bar (that was Approach A).
- No redesign of individual screens' internals beyond moving files and fixing routes/headers.
- No tab bar on auth screens.

## Verification

Expo Router route/folder naming for native tabs is easy to get subtly wrong, so verify in the
**iOS simulator** (this session has the simulator tool), not by static reasoning:

1. Bar stays visible opening player-detail from Home, Search, and Players.
2. Opening detail from Search stays in the Search tab (no tab jump); back returns to the list.
3. More → Compare / Recruitment / Watchlists / Help / Profile / Settings all keep the bar;
   back returns to More.
4. Auth flow (tap gated action → login/signup) shows no bar, and `callbackUrl` still returns
   the user to the right place after login.
5. `npx tsc --noEmit` passes (project's type-check command).
```
