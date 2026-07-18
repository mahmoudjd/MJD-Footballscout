import { ObjectId } from "mongodb";
import { z } from "zod";

export const RecruitmentStageSchema = z.enum([
  "discovered",
  "video_review",
  "live_scouting",
  "shortlist",
  "approval",
  "negotiation",
  "rejected",
]);

export const RecruitmentPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const RecruitmentCandidateInputSchema = z.object({
  playerId: z.string().trim().min(1),
  stage: RecruitmentStageSchema.default("discovered"),
  priority: RecruitmentPrioritySchema.default("medium"),
  assignee: z.string().trim().max(80).default(""),
  deadline: z.coerce.date().nullable().default(null),
  notes: z.string().trim().max(3000).default(""),
});

export const RecruitmentCandidateSchema =
  RecruitmentCandidateInputSchema.extend({
    _id: z.custom<ObjectId>(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type RecruitmentCandidate = z.infer<typeof RecruitmentCandidateSchema>;
