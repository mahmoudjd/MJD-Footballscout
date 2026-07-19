import assert from "node:assert/strict";
import test from "node:test";
import { RecruitmentWorkspaceInputSchema } from "./recruitment-workspace.model";

test("accepts a complete recruitment workspace", () => {
  const result = RecruitmentWorkspaceInputSchema.safeParse({
    templates: [
      {
        id: "template",
        name: "Forward",
        positionGroup: "Forward",
        criteria: [{ id: "finishing", label: "Finishing", weight: 100 }],
      },
    ],
    replacementPlans: [],
    savedSearches: [],
    fitProfiles: [
      {
        id: "fit",
        name: "First team",
        targetAge: 24,
        maxValue: 20_000_000,
        weights: { elo: 40, age: 20, value: 20, scouting: 20 },
      },
    ],
  });
  assert.equal(result.success, true);
});

test("rejects invalid fit weights", () => {
  const result = RecruitmentWorkspaceInputSchema.safeParse({
    templates: [],
    replacementPlans: [],
    savedSearches: [],
    fitProfiles: [
      {
        id: "fit",
        name: "Invalid",
        targetAge: 24,
        maxValue: 1,
        weights: { elo: 101, age: 0, value: 0, scouting: 0 },
      },
    ],
  });
  assert.equal(result.success, false);
});
