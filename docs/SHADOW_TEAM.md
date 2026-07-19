# Shadow Team

Shadow Team is a private recruitment-planning workspace. An authenticated user can model a future squad, place transfer candidates into tactical positions, maintain a shortlist for every position, and immediately see the resulting squad metrics and recruitment gaps.

## Supported formations

| Formation | Structure                                                                 |
| --------- | ------------------------------------------------------------------------- |
| `4-3-3`   | Back four, three midfielders, two wings, and one striker                  |
| `4-2-3-1` | Back four, double pivot, attacking midfielder, two wings, and one striker |
| `4-4-2`   | Back four, midfield four, and two strikers                                |
| `3-5-2`   | Back three, two wing-backs, three central midfielders, and two strikers   |

Every formation has 11 stable slot identifiers and pitch coordinates. These definitions are shared by the API response and the visual formation board.

## User workflow

1. Sign in and open `/shadow-team`.
2. Enter a team name and choose a formation.
3. Select a position on the formation board.
4. Add a player. The first player becomes the primary candidate.
5. Add up to four more players to create a positional shortlist.
6. Use **Set primary** to promote an alternative without removing the remaining shortlist.
7. Review squad coverage, warnings, metrics, and suggested alternatives.

Users can create multiple Shadow Teams for different transfer windows, tactical systems, or recruitment scenarios. Teams and assignments are stored in MongoDB and scoped to the authenticated user.

## Analytics rules

The dashboard calculates:

- **Squad coverage:** Number of formation slots containing at least one candidate.
- **Missing positions:** Formation slots without a candidate.
- **Overstaffed positions:** Slots containing more than one candidate. These represent active positional shortlists.
- **Duplicate assignments:** A player assigned to more than one formation slot.
- **Average age:** Average age of unique primary candidates with a valid age.
- **Average ELO:** Average ELO of unique primary candidates with a valid ELO.
- **Estimated total market value:** Sum of the parsed market values of unique primary candidates.

Only the first candidate in a slot contributes to age, ELO, and market-value metrics. If the same primary player is used in multiple slots, the player contributes only once to aggregate metrics and is additionally reported as a duplicate assignment.

Market value is an estimate derived from the stored source value and currency. It should support recruitment comparison and not be interpreted as an official transfer valuation.

## Alternative recommendations

The detail endpoint returns up to three unassigned alternatives for each formation slot.

- Candidates must match the slot's generic position group: goalkeeper, defender, midfielder, or forward.
- When a primary candidate exists, alternatives are ranked using position, age, ELO, market value, preferred foot, and nationality.
- When a slot is empty, matching candidates are ranked primarily by ELO.
- Every result includes a score and human-readable reasons.

## REST API

All endpoints require `Authorization: Bearer <accessToken>`.

### List teams

```http
GET /shadow-teams
```

The response contains compact team records with `filledSlots` and `candidateCount`.

### Create a team

```http
POST /shadow-teams
Content-Type: application/json

{
  "name": "Summer recruitment 2027",
  "formation": "4-3-3"
}
```

The name must contain 1–80 characters. The default formation is `4-3-3`.

### Get team details

```http
GET /shadow-teams/:id
```

The response combines the persisted team with:

- `slots`: formation labels, position groups, and pitch coordinates
- `players`: assigned player profiles
- `analytics`: calculated squad metrics and warnings
- `alternatives`: recommended candidates for every slot

### Update a team

```http
PUT /shadow-teams/:id
Content-Type: application/json

{
  "name": "Summer recruitment 2027",
  "formation": "4-3-3",
  "assignments": [
    {
      "slotId": "st",
      "playerIds": ["PLAYER_OBJECT_ID", "ALTERNATIVE_OBJECT_ID"]
    }
  ]
}
```

Validation rules:

- A request can contain at most 11 slot assignments.
- Every slot must belong to the selected formation.
- A slot can appear only once.
- Every slot can contain at most five unique player IDs.
- All player IDs must reference existing players.

### Delete a team

```http
DELETE /shadow-teams/:id
```

Deletion returns `204 No Content`. Ownership is checked for every read, update, and deletion operation.

## Data model

Shadow Teams use the MongoDB collection `shadowTeams`:

```ts
interface ShadowTeam {
  _id: ObjectId;
  userId: string;
  name: string;
  formation: "4-3-3" | "4-2-3-1" | "4-4-2" | "3-5-2";
  assignments: Array<{
    slotId: string;
    playerIds: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

The collection has an index on `{ userId: 1, updatedAt: -1 }` for ownership-scoped, recently updated team lists.

## Main implementation files

- `server/src/modules/shadow-teams/shadow-team-formations.ts`
- `server/src/modules/shadow-teams/shadow-team.model.ts`
- `server/src/modules/shadow-teams/shadow-team-analytics.ts`
- `server/src/modules/shadow-teams/shadow-teams.controller.ts`
- `server/src/modules/shadow-teams/shadow-teams.router.ts`
- `web-app/src/features/shadow-team/components/ShadowTeamPageView.tsx`
- `web-app/src/features/shadow-team/api/shadow-team-api.ts`
- `web-app/src/features/shadow-team/hooks/useShadowTeams.ts`

## Verification

Backend analytics tests cover primary-only metrics, shortlist detection, duplicate-player reporting, and prevention of double-counted aggregate values.

```bash
cd server
npm test
./node_modules/.bin/tsc --noEmit

cd ../web-app
./node_modules/.bin/tsc --noEmit
npm run build
```
