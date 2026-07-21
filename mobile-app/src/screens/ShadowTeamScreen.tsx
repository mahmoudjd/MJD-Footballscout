import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { createShadowTeam, deleteShadowTeam, getShadowTeam, getShadowTeams, updateShadowTeam } from "@/src/apiServices";
import AppSelect from "@/src/components/ui/AppSelect";
import FormationBoard from "@/src/components/shadow/FormationBoard";
import AuthRequiredState from "@/src/components/ui/AuthRequiredState";
import CardSurface from "@/src/components/ui/CardSurface";
import LoadingState from "@/src/components/ui/LoadingState";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import Colors from "@/src/constants/Colors";
import { onTint } from "@/src/constants/Theme";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { ShadowTeamAssignment, ShadowTeamDetail, ShadowTeamFormation, ShadowTeamSummary } from "@/src/data/Types";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";

const formations: ShadowTeamFormation[] = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2"];

function formatMoney(value: number) {
  if (!value || value <= 0) return "—";
  if (value >= 1_000_000_000) return `€${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`;
  return `€${Math.round(value)}`;
}

export default function ShadowTeamScreen() {
  const { isDark } = React.useContext(AppContext);
  const { session, isAuthenticated, isAuthReady, refreshSession } = useAuth();
  const colors = Colors[isDark ? "dark" : "light"];
  const [teams, setTeams] = useState<ShadowTeamSummary[]>([]);
  const [detail, setDetail] = useState<ShadowTeamDetail | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newFormation, setNewFormation] = useState<ShadowTeamFormation>("4-3-3");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authorized = useCallback(async <T,>(request: (token: string) => Promise<T>) => {
    if (!session) throw new Error("Login required");
    return runAuthorizedRequest({ session, refreshSession, request });
  }, [session, refreshSession]);

  const loadTeams = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const nextTeams = await authorized(getShadowTeams);
      setTeams(nextTeams);
      setSelectedId((current) => current || nextTeams[0]?._id || "");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shadow Teams could not be loaded";
      Alert.alert("Could not load", message);
    } finally { setLoading(false); }
  }, [session, authorized]);

  useFocusEffect(useCallback(() => { void loadTeams(); }, [loadTeams]));
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    void authorized((token) => getShadowTeam(token, selectedId)).then((value) => {
      setDetail(value); setSelectedSlotId(value.slots[0]?.id || "");
    }).catch((error) => Alert.alert("Could not open team", error instanceof Error ? error.message : "Please try again"));
  }, [selectedId, authorized]);

  const playersById = useMemo(() => new Map((detail?.players || []).map((player) => [player._id, player])), [detail?.players]);
  const selectedSlot = detail?.slots.find((slot) => slot.id === selectedSlotId);
  const selectedAssignment = detail?.assignments.find((item) => item.slotId === selectedSlotId);
  const assignedIds = useMemo(() => new Set(detail?.assignments.flatMap((item) => item.playerIds) || []), [detail?.assignments]);
  // The detail endpoint returns assigned players; alternatives contain the best unassigned candidates per role.
  const roleOptions = useMemo(() => {
    const candidates = detail?.alternatives?.find((item) => item.slotId === selectedSlotId)?.players.map((item) => item.player) || [];
    return candidates.filter((player) => !assignedIds.has(player._id)).map((player) => ({ value: player._id, label: `${getPlayerDisplayName(player)} · ELO ${player.elo || "–"}` }));
  }, [detail, selectedSlotId, assignedIds]);
  const analytics = detail?.analytics;

  const saveAssignments = async (assignments: ShadowTeamAssignment[]) => {
    if (!detail || saving) return;
    setSaving(true);
    try {
      await authorized((token) => updateShadowTeam(token, detail._id, { name: detail.name, formation: detail.formation, assignments }));
      const refreshed = await authorized((token) => getShadowTeam(token, detail._id));
      setDetail(refreshed);
      void loadTeams();
    } catch (error) { Alert.alert("Could not save", error instanceof Error ? error.message : "Please try again"); }
    finally { setSaving(false); }
  };

  const setPrimary = (playerId: string) => {
    if (!detail || !selectedSlotId) return;
    const rest = detail.assignments.filter((item) => item.slotId !== selectedSlotId);
    const current = selectedAssignment?.playerIds.filter((id) => id !== playerId) || [];
    void saveAssignments([...rest, { slotId: selectedSlotId, playerIds: [playerId, ...current].slice(0, 5) }]);
  };
  const clearSlot = () => detail && void saveAssignments(detail.assignments.filter((item) => item.slotId !== selectedSlotId));

  const create = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      const team = await authorized((token) => createShadowTeam(token, { name: newName.trim(), formation: newFormation }));
      setNewName(""); setTeams((current) => [team, ...current]); setSelectedId(team._id);
    } catch (error) { Alert.alert("Could not create", error instanceof Error ? error.message : "Please try again"); }
    finally { setSaving(false); }
  };

  const removeTeam = () => detail && Alert.alert("Delete Shadow Team?", `“${detail.name}” will be permanently deleted.`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      try { await authorized((token) => deleteShadowTeam(token, detail._id)); setDetail(null); setSelectedId(""); await loadTeams(); }
      catch (error) { Alert.alert("Could not delete", error instanceof Error ? error.message : "Please try again"); }
    } },
  ]);

  if (!isAuthReady || (isAuthenticated && loading)) return <LoadingState withTopInset />;
  if (!isAuthenticated) return <AuthRequiredState withTopInset callbackUrl="/shadow-team" message="Sign in to build and save Shadow Teams." />;

  return <ScreenContainer edgeToEdge style={styles.screen}><ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <PageHeaderCard icon="football-outline" title="Shadow Team" subtitle="Build future squads, identify gaps and compare alternatives." />
    <>
      <CardSurface><Text style={[styles.title, { color: colors.text }]}>Create team</Text><TextInput value={newName} onChangeText={setNewName} placeholder="Summer recruitment 2027" placeholderTextColor={colors.notification} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} /><View style={styles.row}><AppSelect placeholder="Formation" options={formations.map((item) => ({ value: item, label: item }))} value={newFormation} onChange={(value) => setNewFormation(value as ShadowTeamFormation)} /><Pressable disabled={!newName.trim() || saving} onPress={create} style={[styles.addButton, { backgroundColor: colors.tint }, (!newName.trim() || saving) && styles.disabled]}><Ionicons name="add" size={20} color={onTint(isDark)} /></Pressable></View></CardSurface>
      {teams.length ? <AppSelect placeholder="Choose team" options={teams.map((team) => ({ value: team._id, label: `${team.name} · ${team.formation}` }))} value={selectedId} onChange={setSelectedId} /> : null}
      {detail ? <>
        <CardSurface><View style={styles.headingRow}><View style={styles.grow}><Text style={[styles.teamName, { color: colors.text }]}>{detail.name}</Text><Text style={[styles.muted, { color: colors.notification }]}>{detail.formation} · {detail.assignments.filter((item) => item.playerIds.length).length}/11 positions filled</Text></View><Pressable onPress={removeTeam} hitSlop={10}><Ionicons name="trash-outline" size={20} color="#dc2626" /></Pressable></View></CardSurface>
        <FormationBoard
          slots={detail.slots}
          assignments={detail.assignments}
          playersById={playersById}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
        />
        {analytics ? <CardSurface>
          <Text style={[styles.title, { color: colors.text }]}>Squad dashboard</Text>
          <Text style={[styles.muted, { color: colors.notification }]}>Based on the primary player in each position.</Text>
          <View style={styles.metricGrid}>
            {[
              { label: "Coverage", value: `${analytics.filledSlots}/${analytics.totalSlots}` },
              { label: "Avg age", value: analytics.averageAge?.toFixed(1) ?? "—" },
              { label: "Avg ELO", value: analytics.averageElo?.toFixed(1) ?? "—" },
              { label: "Total value", value: formatMoney(analytics.totalMarketValue) },
            ].map((metric) => (
              <View key={metric.label} style={[styles.metricCell, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>{metric.value}</Text>
                <Text style={[styles.metricLabel, { color: colors.notification }]}>{metric.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.insightRow}>
            <Ionicons name={analytics.missingPositions.length ? "alert-circle" : "checkmark-circle"} size={16} color={analytics.missingPositions.length ? "#f59e0b" : "#16a34a"} />
            <Text style={[styles.insightText, { color: colors.text }]}>
              {analytics.missingPositions.length ? `${analytics.missingPositions.length} open: ${analytics.missingPositions.map((item) => item.shortLabel).join(", ")}` : "Every position has a primary player"}
            </Text>
          </View>
          {analytics.duplicatePlayers.length ? <View style={styles.insightRow}>
            <Ionicons name="copy-outline" size={16} color="#f59e0b" />
            <Text style={[styles.insightText, { color: colors.text }]}>{analytics.duplicatePlayers.length} player{analytics.duplicatePlayers.length === 1 ? "" : "s"} placed in multiple positions</Text>
          </View> : null}
        </CardSurface> : null}
        {selectedSlot ? <CardSurface><Text style={[styles.title, { color: colors.text }]}>{selectedSlot.label}</Text><Text style={[styles.muted, { color: colors.notification }]}>Select a recommended {selectedSlot.positionGroup.toLowerCase()} as primary player.</Text>{selectedAssignment?.playerIds.map((id, index) => <View key={id} style={[styles.assignedRow, { borderColor: colors.border }]}><Text style={[styles.grow, { color: colors.text, fontWeight: "700" }]}>{index === 0 ? "★ " : ""}{getPlayerDisplayName(playersById.get(id)) || id}</Text>{index > 0 ? <Pressable onPress={() => setPrimary(id)}><Text style={{ color: colors.tint, fontWeight: "800" }}>Make primary</Text></Pressable> : null}</View>)}<AppSelect placeholder="Add recommended player" options={roleOptions} value="" onChange={setPrimary} style={styles.recommendSelect} />{selectedAssignment ? <Pressable onPress={clearSlot} style={styles.clearButton}><Text style={styles.clearText}>Clear position</Text></Pressable> : null}</CardSurface> : null}
      </> : teams.length === 0 ? <CardSurface><Text style={[styles.title, { color: colors.text }]}>No Shadow Teams yet</Text><Text style={[styles.muted, { color: colors.notification }]}>Create your first formation above.</Text></CardSurface> : <LoadingState />}
    </>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { alignItems: "center" }, scroll: { width: "92%", flex: 1 }, content: { gap: 12, paddingBottom: 24 }, title: { fontSize: 17, fontWeight: "800" }, muted: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 12, marginTop: 12, paddingHorizontal: 12, fontSize: 14 }, row: { flexDirection: "row", gap: 8, marginTop: 8 }, addButton: { width: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }, disabled: { opacity: 0.45 }, headingRow: { flexDirection: "row", alignItems: "center", gap: 10 }, grow: { flex: 1 }, teamName: { fontSize: 21, fontWeight: "900" },
  assignedRow: { minHeight: 44, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", gap: 8 }, recommendSelect: { marginTop: 12 }, clearButton: { marginTop: 9, padding: 10, alignItems: "center" }, clearText: { color: "#dc2626", fontWeight: "800" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  metricCell: { width: "47.8%", flexGrow: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11 },
  metricValue: { fontSize: 20, fontWeight: "900", letterSpacing: -0.4 },
  metricLabel: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 3 },
  insightRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  insightText: { flex: 1, fontSize: 12.5, fontWeight: "600", lineHeight: 17 },
});
