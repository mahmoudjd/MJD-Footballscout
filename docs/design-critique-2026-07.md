# Design critique: MJD Football Scout (web + mobile)

**Scope:** all screens, both surfaces · **Stage:** final polish before launch
**Method:** source review of `web-app/src` and `mobile-app/src`; contrast ratios computed from the actual token hex values.

---

## Overall impression

This does not read like a pre-launch app that needs saving. The mobile app has a real design system — `constants/Theme.ts` has a 4pt spacing scale, named radii, a typographic scale, and dark-mode tokens whose comments show someone actually reasoned about halation and accent desaturation on dark surfaces. The web app has a genuine primitive layer (`Button`, `Text`, `Chip`, `Panel`, `Input`) with consistent focus rings and `min-h-11` touch targets. The players table has a `<caption>`, `scope="col"`, and a real `role="progressbar"` with aria values. That is above average.

The biggest opportunity is not any single screen — it's that **the two apps are drifting apart, and the web app's token layer is declared but not used.** Everything below flows from that.

---

## Priority recommendations

### 1. Two German strings are shipping in an English app 🔴

`web-app/src/components/layout/header/mobile-tab-bar.tsx`:

- line 120: `<DialogDescription>Account und weitere Bereiche</DialogDescription>`
- line 204: `Du bist aktuell nicht eingeloggt.`

These are the only two non-English strings in either codebase — everything else is clean English. They sit in the mobile "More" sheet, which is the highest-traffic secondary nav on phones. A first-time visitor on mobile hits a language switch in the first minute. Fix before launch; it costs two minutes.

### 2. The web design tokens are decorative — nothing consumes them

`globals.css` defines a considered palette:

```css
--app-bg: #f5f7f4;  --app-brand: #123c2c;  --app-accent: #d7ff45;
--app-text: #14201a; --app-muted: #66736c; --app-border: rgba(15,50,36,0.1);
```

Grep result: **zero `var(--app-*)` references in any `.tsx` file.** Components hardcode Tailwind classes instead, and those classes don't match the tokens:

| Token | Declared | What components actually use |
|---|---|---|
| `--app-text` `#14201a` | green-black | `Text tone="default"` → `text-slate-900` `#0f172a` (blue-black) |
| `--app-muted` `#66736c` | warm green-grey | `tone="muted"` → `text-stone-600` `#57534e` |
| `--app-brand` `#123c2c` | | `emerald-950` `#022c22` everywhere |
| `--app-accent` `#d7ff45` | | `lime-300` `#bef264` everywhere |

So there are two parallel palettes and the CSS one is dead. Worse, the neutral ramp is split: **171 `stone-*` uses vs 41 `slate-*` uses vs 4 `gray-*`.** `Text tone="default"` is slate while `tone="muted"` is stone — the two most common text tones are from different (warm vs cool) neutral families. On a light green background this reads as a subtle wrongness rather than an obvious bug, which is why it survived to launch.

**Fix:** pick one. Either delete the `--app-*` block and treat Tailwind classes as the system of record, or map Tailwind theme colors to the CSS vars in `@theme` so `emerald-950` *is* `--app-brand`. Then move every neutral to `stone` and change `tone="default"` to `text-stone-900`.

### 3. Web has no dark mode; mobile has a good one 🔴

Grep for `dark:` in `web-app/src`: **2 occurrences across the whole app.** Meanwhile `mobile-app/src/constants/Colors.ts` ships a full dark theme with genuinely thoughtful decisions — lifting dark surfaces off near-black, desaturating the brand lime to `#c9e265` because full-saturation lime glares on dark fills.

Contrast checks on the mobile dark theme all pass comfortably:

| Pair | Ratio |
|---|---|
| text `#e7ece7` on card `#1a231c` | 13.5:1 ✅ |
| notification `#a0aaa1` on card | 6.7:1 ✅ |
| accent `#c9e265` on card | 11.2:1 ✅ |

A scout who uses the phone app at night and the web app at their desk gets two different products. This is the largest cross-platform gap. It's also the biggest single piece of work here, so it's legitimate to ship without it — but say so explicitly rather than letting it be an accident.

---

## Accessibility

Computed against actual hex values (WCAG 2.1 AA: 4.5:1 body, 3:1 large text and UI).

### Failures

| Where | Colors | Ratio | Verdict |
|---|---|---|---|
| Stat labels "AGE / ELO / VALUE" in mobile player cards — `text-stone-400` at `text-[10px]` | `#a8a29e` on white | **2.52:1** | 🔴 Fails badly, and at 10px it's the smallest text in the app |
| Input placeholders — `placeholder:text-stone-400` | `#a8a29e` on white | **2.52:1** | 🔴 8 instances of `text-stone-400` total |

`text-stone-400` needs to become `text-stone-500` (4.80:1 ✅) at minimum. Given these labels are 10px uppercase, `stone-600` (7.63:1) would be safer — small uppercase text loses legibility faster than the ratio alone suggests.

### Borderline (passes 3:1, fails 4.5:1)

| Where | Ratio | Note |
|---|---|---|
| Idle desktop nav links `text-emerald-950/60` on `#f8faf7` | 4.15:1 | Nav labels are 14px semibold — technically not "large text." Bump to `/70`. |
| ELO trend icon `text-emerald-600` on white | 3.77:1 | Decorative + `aria-hidden`, so acceptable as-is. |
| Mobile light `tabIconDefault` `#748078` on white | 4.12:1 | Icon-only; passes the 3:1 UI-component threshold. Fine. |

### Passing well

Primary button (white on `emerald-950`) **15.1:1**. Secondary button (`emerald-950` on `lime-300`) **11.6:1** — the neon lime is used as a *background* with dark text, which is exactly right. Table header (`emerald-50/75` on the emerald gradient) **9.2:1**. Hero copy over the photo **6.5–9.7:1**. `Text tone="subtle"` **4.8:1**, `tone="muted"` **7.6:1**.

One caveat: `lime-300` on white is **1.31:1**. It's currently only used as a background or a decorative dot, which is correct — but it's a trap for the next person. Worth a comment in the token file: *lime is a fill color, never a text color on light surfaces.*

### Other a11y notes

- Focus rings are consistent (`focus-visible:ring-2 ring-lime-500/60`) and `:focus-visible { outline-color: #65a30d }` is set globally. Good.
- `prefers-reduced-motion` is handled globally in `globals.css` **and** per-component via `motion-reduce:` and `motion-safe:`. This is more thorough than most shipped apps.
- Player photos correctly use `alt=""` (decorative — the name is adjacent text). Right call.
- Mobile password toggles have `accessibilityRole`, `accessibilityLabel`, and `hitSlop={8}`. Inputs are `minHeight: 50`. Touch targets are fine throughout.
- ⚠️ In `PlayerTableRow`, the squad-number badge carries `aria-label={\`Squad number ${...}\`}` on a `<span>` with no role. `aria-label` on a generic `span` is ignored by most screen readers. Wrap in `<span role="img" aria-label="...">` or move it to visually-hidden text.

---

## Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Nav order | `nav-links.ts` comments say Squad Builder sits before Compare "mirroring the mobile app's tab order" — but mobile is Home → **Search** → Players → Squad, and web is Home → **Players** → Search → Squad. The comment documents an intent the code doesn't honor. | Pick one order. Mobile's (Search second) is the better argument — the tab layout comment correctly notes search is the primary function. |
| "Squad Builder" vs "Squad" | Desktop nav says "Squad Builder", web mobile tab bar says "Squad", mobile app says "Squad", route is `/shadow-team`, component is `ShadowTeamPageView`. Four names for one feature. | Pick one user-facing label. Keep `shadow-team` internally if you like, but don't let three labels reach the UI. |
| Mobile "More" sheet | Hardcodes Recruitment, Compare, Help, Watchlists, Profile as five copy-pasted `<Link>` blocks with identical 400-char className strings — while `nav-links.ts` exists and only marks Recruitment + Help as secondary. Two sources of truth for the same nav. | Drive the sheet from `nav-links.ts`. Extract the repeated className into a `moreSheetLinkClass` constant. |
| `Panel` `radius` prop | `radiusClasses.default` and `radiusClasses.large` are both `"rounded-3xl"` — identical. 5 call sites pass `radius="large"` believing it does something. | Either give `large` a distinct value or delete the prop and the 5 call sites. |
| Corner radii | `rounded-3xl` ×16, `rounded-2xl` ×79, `rounded-xl` ×64, plus `rounded-lg` and `rounded-full`. Five radii competing. Cards are sometimes `3xl`, sometimes `2xl`. | Mobile already solved this — `radius.sm/md/lg/xl/xxl` in `Theme.ts`. Mirror it on web: one radius for cards, one for controls, one for pills. |
| Shadows | **60 inline `shadow-[0_24px_55px_-38px_rgba(...)]`-style arbitrary values** across components. Some are byte-identical to `--app-shadow` in `globals.css`, redefined inline. | Define 3 elevation levels (mobile has `shadow(isDark)` with `sm/md/lg` — copy that) and replace all 60. |
| Card construction | 8 files build cards as bare `<div className="rounded-3xl border border-emerald-950/...">` rather than using `<Panel>`, which exists and is used in 22 files. | Route the 8 stragglers through `Panel`, or add the variants they need. |
| Font weights | `font-black` and `font-extrabold` appear 21 times on web; mobile `typography` uses weights 500–900 across 9 levels. Both apps lean heavy, but not identically. | Reconcile the two scales. Web's `Text` variants and mobile's `typography` should describe the same ladder. |

---

## Visual hierarchy

**What draws the eye first (home, desktop):** the `text-8xl font-black tracking-[-0.055em]` headline "Find the player who changes the game." over the photo. That's correct — it's the value proposition, and the lime "Modern football intelligence" pill above it is small enough to support rather than compete.

**Reading flow:** headline → subcopy → the two CTAs → the Live/Smart/Fast capability strip → scroll to "Live database" stats. Clean top-to-bottom. The CTA pair is well-differentiated: solid lime primary vs translucent-white outline. No competition between them.

**One concern:** the capability strip is `Live / player data`, `Smart / comparison`, `Fast / shortlisting` — styled as a `<dl>` with the *adjective* at `text-2xl font-extrabold` and the *noun* at `text-xs`. The eye lands on "Live Smart Fast", which is three adjectives with no object. Stat strips in this position usually carry numbers (`12,400 players`, `98 leagues`) and earn their visual weight. Adjectives at that size read as filler. Either put real numbers there — you have a live database, use it — or drop the size contrast so it reads as a sentence.

**Players table:** hierarchy is good. Name is the boldest thing in the row, position badges use consistent color coding (Forward=rose, Midfielder=emerald, Defender=sky, Goalkeeper=amber, Manager=stone), ELO gets a progress bar, market value is `tabular-nums` and right-aligned. The mobile card variant preserves the same priority order. This is the strongest screen in the app.

**Emphasis concern:** every card in the app has a lift-on-hover (`hover:-translate-y-0.5`) plus a shadow change plus a border change. When everything lifts, nothing is emphasized. Consider reserving translate-on-hover for genuinely clickable cards and using border-color alone for the rest.

---

## Responsive / layout

- The players table is `min-w-[1180px]` inside `overflow-x-auto`, shown only at `lg:`, with a purpose-built card grid below that. This is the right pattern — a separate mobile representation, not a squeezed table.
- ⚠️ `ScrollToTopButton` is `fixed right-4 bottom-24` on mobile, and the mobile tab bar's More dialog anchors to `bottom-[calc(6.25rem+env(safe-area-inset-bottom))]` (=100px). The scroll button at `bottom-24` (96px) sits just under that, and the tab bar itself is roughly that tall. **On a device with a home indicator, the scroll-to-top button likely overlaps the tab bar.** The tab bar accounts for `env(safe-area-inset-bottom)`; the scroll button does not. Change to `bottom-[calc(6rem+env(safe-area-inset-bottom))]`.
- `body { min-width: 320px }` plus `overflow-x: hidden` is a reasonable floor, but `overflow-x: hidden` on `body` will also silently swallow any genuine horizontal overflow bug rather than surfacing it. Worth removing during QA to see what shows up.

---

## Code health affecting design (worth flagging pre-launch)

Not design per se, but these predict where inconsistency will creep in next:

- `mobile-app/src/app/profile.tsx` — **1350 lines**. `PlayerProfile.tsx` — 1174. `WatchlistsScreen.tsx` — 1028.
- `web-app/src/features/account/components/AccountProfilePageView.tsx` — **1048 lines**.
- Mobile has both `app/watchlists-screen.tsx` (a one-line re-export) and `screens/WatchlistsScreen.tsx`, same for ShadowTeam and Recruitment. The indirection is fine but undocumented.

Files this size are where hardcoded colors and one-off spacing accumulate — most of the 60 inline shadows and the stone/slate split live in the big files. Splitting them is the durable fix for consistency, not a one-time find-and-replace.

---

## What works well

- **The mobile dark theme is genuinely well-reasoned.** The comments explaining why dark surfaces are lifted off black and why the lime is desaturated show design judgment, not just token-copying. Every pair I measured passes AA comfortably.
- **Accessibility fundamentals are solid**: table `<caption>` + `scope="col"`, real `role="progressbar"` with aria values, `aria-current="page"` on nav, decorative images correctly `alt=""`, `aria-hidden` on decorative icons, `accessibilityRole`/`accessibilityLabel` on mobile Pressables.
- **Motion is handled properly on both axes** — global `prefers-reduced-motion` in CSS *and* `motion-reduce:` / `motion-safe:` utilities per component. Rare.
- **Touch targets are consistently sized**: `min-h-11` (44px) on web buttons and nav links, `minHeight: 50` on mobile inputs and buttons. No violations found.
- **The lime is used correctly** — as a fill with dark text on it (11.6:1), never as text on light. That's the discipline that keeps a neon brand color from becoming an accessibility problem.
- **The players table** is the best-executed screen: clear hierarchy, semantic markup, a real mobile alternative, consistent position color coding.
- **`NativeTabs` follows the platform rather than imitating it** — Liquid Glass on iOS 26, Material on Android, with the 5-destination Android limit explicitly accounted for. Correct instinct.

---

## Suggested launch cut

**Must fix (hours, not days):**

1. The two German strings in `mobile-tab-bar.tsx` (lines 120, 204)
2. `text-stone-400` → `text-stone-500`/`600` — 8 instances, fixes both contrast failures
3. `ScrollToTopButton` safe-area overlap
4. Delete or implement `Panel`'s `radius="large"`

**Should fix (a day):**

5. Unify the neutral ramp — pick `stone`, change `Text tone="default"` off `slate-900`
6. Reconcile the nav order + the "Squad Builder"/"Squad" naming
7. Drive the More sheet from `nav-links.ts`
8. Bump idle nav links to `emerald-950/70`

**Post-launch:**

9. Web dark mode (port the mobile tokens — the hard thinking is already done)
10. Wire `--app-*` vars to Tailwind theme so there's one palette
11. Elevation scale to replace the 60 inline shadows
12. Split the four 1000+ line files
