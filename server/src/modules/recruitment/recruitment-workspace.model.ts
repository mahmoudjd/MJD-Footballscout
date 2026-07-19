import { ObjectId } from "mongodb";
import { z } from "zod";

const WeightedCriterionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  weight: z.number().min(0).max(100),
});
export const ScoutingTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  positionGroup: z.enum([
    "All",
    "Goalkeeper",
    "Defender",
    "Midfielder",
    "Forward",
  ]),
  criteria: z.array(WeightedCriterionSchema).min(1).max(12),
});
export const ReplacementPlanSchema = z.object({
  id: z.string().min(1),
  incumbentPlayerId: z.string().min(1),
  reason: z.enum(["contract_end", "sale", "performance", "age", "depth"]),
  targetPlayerIds: z.array(z.string()).max(10),
  notes: z.string().max(2000),
});
export const SavedSearchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  position: z.string(),
  minAge: z.number().nullable(),
  maxAge: z.number().nullable(),
  minElo: z.number().nullable(),
  maxElo: z.number().nullable(),
  maxValue: z.number().nullable(),
  alertsEnabled: z.boolean(),
  lastMatchCount: z.number().int().min(0),
});
export const FitProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  targetAge: z.number().min(15).max(45),
  maxValue: z.number().min(0),
  weights: z.object({
    elo: z.number().min(0).max(100),
    age: z.number().min(0).max(100),
    value: z.number().min(0).max(100),
    scouting: z.number().min(0).max(100),
  }),
});
export const RecruitmentWorkspaceInputSchema = z.object({
  templates: z.array(ScoutingTemplateSchema).max(30),
  replacementPlans: z.array(ReplacementPlanSchema).max(50),
  savedSearches: z.array(SavedSearchSchema).max(50),
  fitProfiles: z.array(FitProfileSchema).max(20),
});
export const RecruitmentWorkspaceSchema =
  RecruitmentWorkspaceInputSchema.extend({
    _id: z.custom<ObjectId>(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
export type RecruitmentWorkspace = z.infer<typeof RecruitmentWorkspaceSchema>;
