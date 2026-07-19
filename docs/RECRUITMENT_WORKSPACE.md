# Recruitment Workspace

The Recruitment Workspace connects player discovery, evaluation and squad planning in one authenticated workflow at `/recruitment`.

## Features

### Recruitment Pipeline

Each player can appear once per user's pipeline and moves through seven stages: Discovered, Video Review, Live Scouting, Shortlist, Approval, Negotiation and Rejected. Candidates store priority, assignee, deadline and decision notes.

### Scouting Templates

Users create position-specific evaluation templates with weighted technical, tactical, physical and mental criteria. Weights can be adapted to the club's playing model.

### Replacement Planner

A current player can be flagged because of contract expiry, potential sale, performance, age profile or squad depth. The initial successor list contains the three highest-ELO players from the same position group and links directly to their profiles.

### Saved Searches & Alerts

Reusable searches store position, age, ELO and value boundaries. The workspace compares the current number of matching players with the last acknowledged count and highlights new matches.

### Recruitment Fit Score

Fit profiles define a target age, maximum transfer value and weights for ELO, age, value and scouting evidence. The score is normalized to 0–100. Pipeline progress supplies the scouting signal; players without pipeline evidence receive a neutral score.

## API

All routes require a Bearer access token.

- `GET /recruitment/candidates`
- `POST /recruitment/candidates`
- `PUT /recruitment/candidates/:id`
- `DELETE /recruitment/candidates/:id`
- `GET /recruitment/workspace`
- `PUT /recruitment/workspace`

Candidate records are stored in `recruitmentCandidates`. Templates, replacement plans, saved searches and fit profiles are stored in one user-scoped `recruitmentWorkspaces` document. Unique indexes prevent duplicate candidates and duplicate workspaces per user.
