# Changelog

Meaningful changes to MJD Football Scout are documented here. The in-app version is available under **Help → What’s New**.

## v3.0 — 2026-07-18

### Added

- Persistent Shadow Teams with 4-3-3, 4-2-3-1, 4-4-2 and 3-5-2 formations.
- Primary candidates and positional shortlists with automatic squad analytics.
- Missing-position and duplicate-player signals plus explainable player alternatives.
- Explainable similar-player recommendations in player profiles.
- Match scores based on position, age, ELO, market value, preferred foot and nationality.
- Plain-language reasons for each player recommendation.
- Profile & Security page.
- Forgot-password and password-reset flows.
- Recoverable account deactivation that preserves the database record.
- Structured scouting reports and scouting decisions.
- Player history for ELO, market value and club changes.
- Watchlists and side-by-side player comparison.
- Help & What’s New center with workflow guidance and searchable FAQs.
- Seven-stage recruitment pipeline with priorities, owners, deadlines and decision notes.
- Weighted, position-specific scouting templates.
- Squad replacement plans with automatically suggested successors.
- Saved player searches with changing match counts and alerts.
- Configurable Recruitment Fit Scores based on ELO, age, value and scouting progress.

### Changed

- Unified page widths, navigation and responsive layouts.
- Modernized the players table, filters, profile tabs and attribute presentation.
- Improved buttons, panels, loading states, empty states and mobile navigation.

### Fixed

- Normalized scraped player positions so forwards are stored and displayed correctly.
- Corrected the ELO progress indicator in the players table.
- Removed duplicate loading feedback from player search.
- Normalized Shadow Team API timestamps before formatting dates in the interface.

## Maintaining This Changelog

For every user-visible feature:

1. Add an entry to `releaseNotes` in `web-app/src/features/help/content/help-content.ts`.
2. Add the same release summary to this file.
3. Use a semantic version and an ISO date (`YYYY-MM-DD`).
