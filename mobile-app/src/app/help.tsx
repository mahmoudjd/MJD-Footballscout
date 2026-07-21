import React from "react";
import { router } from "expo-router";
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";
import CardSurface from "@/src/components/ui/CardSurface";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HelpStep = {
  title: string;
  description: string;
  action: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

type FaqItem = { question: string; answer: string; tips?: string[] };
type FaqGroup = { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; items: FaqItem[] };

const helpSteps: HelpStep[] = [
  { title: "Discover players", description: "Browse the database and narrow it with position and profile filters.", action: "Open Players", icon: "people-outline", href: "/(tabs)/playerList" },
  { title: "Search the web", description: "Find a player by name and import scouting data from connected sources.", action: "Start Search", icon: "search-outline", href: "/(tabs)/search" },
  { title: "Compare profiles", description: "Review ELO, market value, age and profile details side by side.", action: "Compare", icon: "git-compare-outline", href: "/(tabs)/compare" },
  { title: "Build watchlists", description: "Group interesting players into shortlists for later decisions.", action: "Open Watchlists", icon: "heart-outline", href: "/(tabs)/watchlists" },
  { title: "Plan a shadow team", description: "Place primary targets and alternatives into a formation and reveal gaps.", action: "Build Shadow Team", icon: "football-outline", href: "/shadow-team" },
  { title: "Manage recruitment", description: "Move candidates through a pipeline and coordinate every decision.", action: "Open Recruitment", icon: "briefcase-outline", href: "/recruitment" },
];

const faqGroups: FaqGroup[] = [
  {
    title: "Players & Data",
    description: "Searching, importing and understanding player information.",
    icon: "server-outline",
    items: [
      { question: "How do I find a player?", answer: "Use Players to filter existing profiles or Search to look up a player by name across the connected web sources.", tips: ["Enter at least 2 characters.", "Try the full name when several players share a surname."] },
      { question: "How do I refresh player data?", answer: "Open the player profile and select Update Data. The app checks the connected sources and keeps the existing profile when no reliable update is found." },
      { question: "What does the ELO value mean?", answer: "ELO is a relative performance indicator used to compare players. Read the 0–100 progress bar together with age, position and scouting context." },
      { question: "How are similar players selected?", answer: "The recommendation score compares position, age, ELO, market value, preferred foot and nationality. Each result includes match reasons." },
    ],
  },
  {
    title: "Scouting Workflow",
    description: "Comparisons, reports and watchlists.",
    icon: "clipboard-outline",
    items: [
      { question: "How do I compare players?", answer: "Open Compare, select at least 2 players and review the highlighted leaders across the available metrics." },
      { question: "Who can edit a scouting report?", answer: "Authenticated users can create a report. You can edit or delete only your own report, while the profile shows the combined scouting summary." },
      { question: "What is a watchlist?", answer: "A watchlist is a private collection of players. Use separate lists for transfer targets, position needs or follow-up scouting." },
      { question: "How does a Shadow Team work?", answer: "Choose a formation and add candidates to each position. The first player is the primary choice; others form the positional shortlist. The dashboard then calculates coverage, age, ELO and value.", tips: ["Tap Set primary to promote an alternative.", "A player used in several positions is flagged as a duplicate."] },
      { question: "What is the Recruitment Pipeline?", answer: "The pipeline tracks every candidate from discovery through video review, live scouting, shortlist, approval and negotiation with priorities and decision notes." },
    ],
  },
  {
    title: "Account & Security",
    description: "Access, passwords and account status.",
    icon: "shield-checkmark-outline",
    items: [
      { question: "What if I forgot my password?", answer: "Open Forgot password from the login screen, submit your email and follow the reset link. The response never reveals whether an account exists." },
      { question: "Why do I need to verify my email?", answer: "New password-based accounts confirm their email before first sign-in. Verification links expire and can be requested again from the login screen." },
      { question: "How do I activate Premium?", answer: "Premium features such as Shadow Team and Recruitment are managed on the web app with secure Stripe checkout. Your access syncs automatically to mobile." },
      { question: "Who sees advertising?", answer: "Guests and Free-plan users see clearly labelled advertising. Premium subscribers and administrators browse fully ad-free." },
    ],
  },
];

function FaqRow({ item, isDark }: { item: FaqItem; isDark: boolean }) {
  const colors = Colors[isDark ? "dark" : "light"];
  const [open, setOpen] = React.useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((current) => !current);
  };
  return (
    <View style={[styles.faqRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <Pressable accessibilityRole="button" onPress={toggle} style={styles.faqHead}>
        <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
        <Ionicons name={open ? "remove-circle-outline" : "add-circle-outline"} size={20} color={colors.tint} />
      </Pressable>
      {open ? (
        <View style={styles.faqBody}>
          <Text style={[styles.faqAnswer, { color: colors.notification }]}>{item.answer}</Text>
          {item.tips?.length ? (
            <View style={styles.tips}>
              {item.tips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Ionicons name="ellipse" size={5} color={colors.tint} style={styles.tipDot} />
                  <Text style={[styles.tipText, { color: colors.notification }]}>{tip}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function HelpScreen() {
  const { isDark } = React.useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];

  return (
    <ScreenContainer withTopInset style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeaderCard
          icon="help-buoy-outline"
          title="Help center"
          subtitle="Learn the scouting workflow and find quick answers to common questions."
        />

        <CardSurface style={styles.sectionCard} padding={14} radius={20}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="compass-outline" size={16} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Getting started</Text>
          </View>
          <View style={styles.stepsWrap}>
            {helpSteps.map((step) => (
              <Pressable
                key={step.title}
                onPress={() => router.push(step.href as never)}
                style={({ pressed }) => [styles.stepItem, { borderColor: colors.border, backgroundColor: colors.background, opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[styles.stepIcon, { backgroundColor: isDark ? "rgba(215,255,69,0.10)" : "rgba(215,255,69,0.28)" }]}>
                  <Ionicons name={step.icon} size={17} color={colors.tint} />
                </View>
                <View style={styles.stepText}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDescription, { color: colors.notification }]}>{step.description}</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={colors.notification} />
              </Pressable>
            ))}
          </View>
        </CardSurface>

        {faqGroups.map((group) => (
          <CardSurface key={group.title} style={styles.sectionCard} padding={14} radius={20}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name={group.icon} size={16} color={colors.tint} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{group.title}</Text>
            </View>
            <Text style={[styles.groupDescription, { color: colors.notification }]}>{group.description}</Text>
            <View style={styles.faqWrap}>
              {group.items.map((item) => (
                <FaqRow key={item.question} item={item} isDark={isDark} />
              ))}
            </View>
          </CardSurface>
        ))}

        <CardSurface style={styles.sectionCard} padding={16} radius={20}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="chatbubbles-outline" size={16} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Still need help?</Text>
          </View>
          <Text style={[styles.groupDescription, { color: colors.notification }]}>
            For account, billing or data questions, reach the team from the web app's contact page. Your Premium status and data stay in sync across web and mobile.
          </Text>
        </CardSurface>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: "center" },
  scroll: { width: "92%", flex: 1 },
  content: { paddingTop: 0, paddingBottom: 24, gap: 12 },
  sectionCard: { gap: 10 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { fontSize: 17, fontWeight: "800" },
  groupDescription: { fontSize: 12.5, lineHeight: 18, marginTop: -2 },
  stepsWrap: { gap: 8 },
  stepItem: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  stepIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 14, fontWeight: "800" },
  stepDescription: { fontSize: 12, lineHeight: 16 },
  faqWrap: { gap: 8 },
  faqRow: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: "800", lineHeight: 19 },
  faqBody: { marginTop: 8, gap: 8 },
  faqAnswer: { fontSize: 13, lineHeight: 19 },
  tips: { gap: 5 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  tipDot: { marginTop: 7 },
  tipText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
});
