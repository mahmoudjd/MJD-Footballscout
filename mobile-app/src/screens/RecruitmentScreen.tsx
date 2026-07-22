import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  createRecruitmentCandidate,
  deleteRecruitmentCandidate,
  getAllPlayers,
  getRecruitmentCandidates,
  updateRecruitmentCandidate,
} from "@/src/apiServices";
import AppSelect from "@/src/components/ui/AppSelect";
import AppButton from "@/src/components/ui/AppButton";
import AnimatedEntrance from "@/src/components/ui/AnimatedEntrance";
import AuthRequiredState from "@/src/components/ui/AuthRequiredState";
import CardSurface from "@/src/components/ui/CardSurface";
import LoadingState from "@/src/components/ui/LoadingState";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import Colors from "@/src/constants/Colors";
import { accentSoft, accentSoftText, numeric } from "@/src/constants/Theme";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import {
  PlayerType,
  RecruitmentCandidate,
  RecruitmentCandidateInput,
  RecruitmentPriority,
  RecruitmentStage,
} from "@/src/data/Types";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";

const stages: Array<{ value: RecruitmentStage; label: string }> = [
  { value: "discovered", label: "Discovered" },
  { value: "video_review", label: "Video review" },
  { value: "live_scouting", label: "Live scouting" },
  { value: "shortlist", label: "Shortlist" },
  { value: "approval", label: "Approval" },
  { value: "negotiation", label: "Negotiation" },
  { value: "rejected", label: "Rejected" },
];
const priorities: RecruitmentPriority[] = ["low", "medium", "high", "critical"];

const PRIORITY_TONE: Record<RecruitmentPriority, { fg: string; soft: string }> = {
  low: { fg: "#64748b", soft: "rgba(100,116,139,0.14)" },
  medium: { fg: "#0ea5e9", soft: "rgba(14,165,233,0.14)" },
  high: { fg: "#f59e0b", soft: "rgba(245,158,11,0.16)" },
  critical: { fg: "#f43f5e", soft: "rgba(244,63,94,0.14)" },
};

function payload(candidate: RecruitmentCandidate, changes: Partial<RecruitmentCandidateInput>) {
  return {
    playerId: candidate.playerId,
    stage: candidate.stage,
    priority: candidate.priority,
    assignee: candidate.assignee,
    deadline: candidate.deadline,
    notes: candidate.notes,
    ...changes,
  };
}

export default function RecruitmentScreen() {
  const { isDark } = React.useContext(AppContext);
  const { session, isAuthenticated, isAuthReady, refreshSession } = useAuth();
  const colors = Colors[isDark ? "dark" : "light"];
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [priority, setPriority] = useState<RecruitmentPriority>("medium");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authorized = useCallback(
    async <T,>(request: (token: string) => Promise<T>) => {
      if (!session) throw new Error("Login required");
      return runAuthorizedRequest({ session, refreshSession, request });
    },
    [session, refreshSession],
  );

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [nextCandidates, nextPlayers] = await Promise.all([
        authorized(getRecruitmentCandidates),
        getAllPlayers(),
      ]);
      setCandidates(nextCandidates);
      setPlayers(nextPlayers);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Recruitment data could not be loaded";
      Alert.alert("Could not load", message);
    } finally {
      setLoading(false);
    }
  }, [session, authorized]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const candidateIds = useMemo(() => new Set(candidates.map((item) => item.playerId)), [candidates]);
  const playerOptions = useMemo(
    () => players.filter((item) => !candidateIds.has(item._id)).map((item) => ({
      value: item._id,
      label: `${getPlayerDisplayName(item)} · ${item.position || "Unknown"}`,
    })),
    [players, candidateIds],
  );
  const metrics = useMemo(() => ({
    active: candidates.filter((item) => item.stage !== "rejected").length,
    ready: candidates.filter((item) => ["shortlist", "approval", "negotiation"].includes(item.stage)).length,
    critical: candidates.filter((item) => item.priority === "critical" && item.stage !== "rejected").length,
  }), [candidates]);
  const candidatesByStage = useMemo(() => {
    const grouped = new Map<RecruitmentStage, RecruitmentCandidate[]>();
    for (const stage of stages) grouped.set(stage.value, []);
    for (const candidate of candidates) grouped.get(candidate.stage)?.push(candidate);
    return grouped;
  }, [candidates]);

  const create = async () => {
    if (!playerId || saving) return;
    setSaving(true);
    try {
      const created = await authorized((token) => createRecruitmentCandidate(token, {
        playerId, priority, stage: "discovered", assignee: "", deadline: null, notes: "",
      }));
      setCandidates((current) => [created, ...current]);
      setPlayerId("");
    } catch (error) {
      Alert.alert("Could not add candidate", error instanceof Error ? error.message : "Please try again");
    } finally { setSaving(false); }
  };

  const update = async (candidate: RecruitmentCandidate, changes: Partial<RecruitmentCandidateInput>) => {
    try {
      const updated = await authorized((token) => updateRecruitmentCandidate(token, candidate._id, payload(candidate, changes)));
      setCandidates((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (error) { Alert.alert("Could not update", error instanceof Error ? error.message : "Please try again"); }
  };

  const remove = (candidate: RecruitmentCandidate) => Alert.alert(
    "Remove candidate?",
    `${getPlayerDisplayName(candidate.player || undefined)} will leave the pipeline.`,
    [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: async () => {
      try {
        await authorized((token) => deleteRecruitmentCandidate(token, candidate._id));
        setCandidates((current) => current.filter((item) => item._id !== candidate._id));
      } catch (error) { Alert.alert("Could not remove", error instanceof Error ? error.message : "Please try again"); }
    }}],
  );

  if (!isAuthReady || (isAuthenticated && loading)) return <LoadingState withTopInset />;
  if (!isAuthenticated) return <AuthRequiredState withTopInset callbackUrl="/recruitment" message="Sign in to manage your recruitment pipeline." />;

  return <ScreenContainer edgeToEdge style={styles.screen}>
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PageHeaderCard icon="briefcase-outline" title="Recruitment" subtitle="Move scouting targets from discovery to negotiation." />
      <>
        <View style={styles.metrics}>
          {[
            { key: "active", label: "Active", value: metrics.active, icon: "pulse" as const, fg: "#0ea5e9", soft: "rgba(14,165,233,0.14)" },
            { key: "ready", label: "Ready", value: metrics.ready, icon: "checkmark-circle" as const, fg: "#10b981", soft: "rgba(16,185,129,0.14)" },
            { key: "critical", label: "Critical", value: metrics.critical, icon: "flame" as const, fg: "#f43f5e", soft: "rgba(244,63,94,0.14)" },
          ].map((m) => (
            <CardSurface key={m.key} style={styles.metric} padding={12} radius={16}>
              <View style={[styles.metricIcon, { backgroundColor: m.soft }]}>
                <Ionicons name={m.icon} size={14} color={m.fg} />
              </View>
              <Text style={[styles.metricValue, numeric, { color: colors.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.notification }]}>{m.label}</Text>
            </CardSurface>
          ))}
        </View>
        <CardSurface>
          <Text style={[styles.title, { color: colors.text }]}>Add target</Text>
          <View style={styles.formRow}><AppSelect placeholder="Choose player" options={playerOptions} value={playerId} onChange={setPlayerId} /><AppSelect compact placeholder="Priority" options={priorities.map((item) => ({ value: item, label: item }))} value={priority} onChange={(value) => setPriority(value as RecruitmentPriority)} style={styles.prioritySelect} /></View>
          <AppButton label="Add to pipeline" icon="add" size="md" loading={saving} disabled={!playerId || saving} onPress={create} style={styles.addBtn} />
        </CardSurface>
        {stages.map((stage) => {
          const items = candidatesByStage.get(stage.value) || [];
          if (!items.length) return null;
          return (
            <View key={stage.value} style={styles.stageSection}>
              <View style={styles.stageHeading}>
                <Text style={[styles.title, { color: colors.text }]}>{stage.label}</Text>
                <View style={[styles.countChip, { backgroundColor: accentSoft(isDark) }]}>
                  <Text style={[styles.count, { color: accentSoftText(isDark) }]}>{items.length}</Text>
                </View>
              </View>
              {items.map((candidate, index) => {
                const pt = PRIORITY_TONE[candidate.priority];
                return (
                  <AnimatedEntrance key={candidate._id} delay={index * 60}>
                    <CardSurface padding={14} radius={18}>
                      <View style={styles.cardTop}>
                        <View style={styles.grow}>
                          <Text style={[styles.playerName, { color: colors.text }]}>{getPlayerDisplayName(candidate.player || undefined)}</Text>
                          <Text style={[styles.muted, { color: colors.notification }]}>{candidate.player?.position || "Unknown position"} · {candidate.player?.currentClub || candidate.player?.country || "No club"}</Text>
                        </View>
                        <View style={[styles.priorityPill, { backgroundColor: pt.soft }]}>
                          <View style={[styles.priorityDot, { backgroundColor: pt.fg }]} />
                          <Text style={[styles.priorityText, { color: pt.fg }]}>{candidate.priority}</Text>
                        </View>
                        <Pressable onPress={() => remove(candidate)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Remove candidate"><Ionicons name="trash-outline" size={19} color="#dc2626" /></Pressable>
                      </View>
                      <View style={styles.formRow}><AppSelect compact placeholder="Stage" options={stages} value={candidate.stage} onChange={(value) => void update(candidate, { stage: value as RecruitmentStage })} /><AppSelect compact placeholder="Priority" options={priorities.map((item) => ({ value: item, label: item }))} value={candidate.priority} onChange={(value) => void update(candidate, { priority: value as RecruitmentPriority })} /></View>
                    </CardSurface>
                  </AnimatedEntrance>
                );
              })}
            </View>
          );
        })}
        {!candidates.length ? <CardSurface><Text style={[styles.title, { color: colors.text }]}>Pipeline is empty</Text><Text style={[styles.muted, { color: colors.notification }]}>Add your first player above to start a recruitment process.</Text></CardSurface> : null}
      </>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { alignItems: "center" }, scroll: { flex: 1, width: "92%" }, content: { gap: 12, paddingBottom: 24 },
  metrics: { flexDirection: "row", gap: 8 }, metric: { flex: 1 },
  metricIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  metricValue: { fontSize: 23, fontWeight: "900", letterSpacing: -0.5 }, metricLabel: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 2 },
  title: { fontSize: 17, fontWeight: "800" }, muted: { fontSize: 12, lineHeight: 18, marginTop: 2 }, formRow: { flexDirection: "row", gap: 8, marginTop: 12 }, prioritySelect: { maxWidth: 120 }, addBtn: { marginTop: 10 },
  stageSection: { gap: 8 }, stageHeading: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 3 },
  countChip: { minWidth: 24, alignItems: "center", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }, count: { fontWeight: "900", fontSize: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 }, grow: { flex: 1 }, playerName: { fontSize: 15, fontWeight: "800" },
  priorityPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
});
