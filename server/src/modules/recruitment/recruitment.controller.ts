import { ObjectId } from "mongodb";
import { AppContext } from "../../context/types";
import { ApiError } from "../../middleware/customErrors";
import { RecruitmentCandidateInputSchema } from "./recruitment-candidate.model";
import { RecruitmentWorkspaceInputSchema } from "./recruitment-workspace.model";

function serializeCandidate(candidate: any, player?: any) {
  return {
    ...candidate,
    _id: String(candidate._id),
    player: player ? { ...player, _id: String(player._id) } : null,
  };
}

async function requireCandidate(
  context: AppContext,
  candidateId: string,
  userId: string,
) {
  if (!ObjectId.isValid(candidateId))
    throw new ApiError(400, "Invalid candidate id");
  const candidate = await context.recruitmentCandidates.findOne({
    _id: new ObjectId(candidateId),
    userId,
  });
  if (!candidate) throw new ApiError(404, "Recruitment candidate not found");
  return candidate;
}

export async function listRecruitmentCandidates(
  context: AppContext,
  userId: string,
) {
  const candidates = await context.recruitmentCandidates
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
  const playerIds = candidates
    .map((candidate) => candidate.playerId)
    .filter(ObjectId.isValid)
    .map((playerId) => new ObjectId(playerId));
  const players = playerIds.length
    ? await context.players.find({ _id: { $in: playerIds } }).toArray()
    : [];
  const playersById = new Map(
    players.map((player) => [String(player._id), player]),
  );
  return candidates.map((candidate) =>
    serializeCandidate(candidate, playersById.get(candidate.playerId)),
  );
}

export async function createRecruitmentCandidate(
  context: AppContext,
  userId: string,
  payload: unknown,
) {
  const input = RecruitmentCandidateInputSchema.parse(payload);
  if (!ObjectId.isValid(input.playerId))
    throw new ApiError(400, "Invalid player id");
  const player = await context.players.findOne({
    _id: new ObjectId(input.playerId),
  });
  if (!player) throw new ApiError(404, "Player not found");
  const existing = await context.recruitmentCandidates.findOne({
    userId,
    playerId: input.playerId,
  });
  if (existing)
    throw new ApiError(409, "Player is already in the recruitment pipeline");
  const now = new Date();
  const candidate = { ...input, userId, createdAt: now, updatedAt: now };
  const result = await context.recruitmentCandidates.insertOne(
    candidate as any,
  );
  return serializeCandidate({ ...candidate, _id: result.insertedId }, player);
}

export async function updateRecruitmentCandidate(
  context: AppContext,
  candidateId: string,
  userId: string,
  payload: unknown,
) {
  const current = await requireCandidate(context, candidateId, userId);
  const input = RecruitmentCandidateInputSchema.parse({
    ...(typeof payload === "object" && payload !== null ? payload : {}),
    playerId: current.playerId,
  });
  const updated = await context.recruitmentCandidates.findOneAndUpdate(
    { _id: current._id, userId },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!updated)
    throw new ApiError(500, "Failed to update recruitment candidate");
  const player = ObjectId.isValid(updated.playerId)
    ? await context.players.findOne({ _id: new ObjectId(updated.playerId) })
    : null;
  return serializeCandidate(updated, player);
}

export async function deleteRecruitmentCandidate(
  context: AppContext,
  candidateId: string,
  userId: string,
) {
  const candidate = await requireCandidate(context, candidateId, userId);
  await context.recruitmentCandidates.deleteOne({ _id: candidate._id, userId });
}

const emptyWorkspace = {
  templates: [],
  replacementPlans: [],
  savedSearches: [],
  fitProfiles: [],
};

function serializeWorkspace(workspace: any) {
  return { ...workspace, _id: String(workspace._id) };
}

export async function getRecruitmentWorkspace(
  context: AppContext,
  userId: string,
) {
  const existing = await context.recruitmentWorkspaces.findOne({ userId });
  if (existing) return serializeWorkspace(existing);
  const now = new Date();
  const workspace = {
    userId,
    ...emptyWorkspace,
    createdAt: now,
    updatedAt: now,
  };
  const result = await context.recruitmentWorkspaces.insertOne(
    workspace as any,
  );
  return serializeWorkspace({ ...workspace, _id: result.insertedId });
}

export async function updateRecruitmentWorkspace(
  context: AppContext,
  userId: string,
  payload: unknown,
) {
  const input = RecruitmentWorkspaceInputSchema.parse(payload);
  const now = new Date();
  const updated = await context.recruitmentWorkspaces.findOneAndUpdate(
    { userId },
    {
      $set: { ...input, updatedAt: now },
      $setOnInsert: { userId, createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (!updated)
    throw new ApiError(500, "Failed to update recruitment workspace");
  return serializeWorkspace(updated);
}
