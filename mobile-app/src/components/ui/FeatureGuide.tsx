import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { hasSeenHelpGuide, markHelpGuideAsSeen } from "@/src/utils/helpGuideStorage";

export type GuideSection = {
  id: string;
  title: string;
  description: string;
  steps: string[];
};

type Props = {
  guideId: string;
  title: string;
  description: string;
  sections: GuideSection[];
  triggerLabel?: string;
  autoOpen?: boolean;
};

export default function FeatureGuide({
  guideId,
  title,
  description,
  sections,
  triggerLabel = "Help",
  autoOpen = true,
}: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const [isVisible, setIsVisible] = useState(false);
  const [isSeen, setIsSeen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSeen = async () => {
      try {
        const seen = await hasSeenHelpGuide(guideId);
        if (!isMounted) return;
        setIsSeen(seen);
        if (!seen && autoOpen) {
          setIsVisible(true);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadSeen();
    return () => {
      isMounted = false;
    };
  }, [guideId, autoOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleMarkSeen = useCallback(async () => {
    await markHelpGuideAsSeen(guideId);
    setIsSeen(true);
    setIsVisible(false);
  }, [guideId]);

  const triggerText = useMemo(
    () => (isSeen ? `${triggerLabel}` : `${triggerLabel} • New`),
    [isSeen, triggerLabel],
  );

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={[
          styles.triggerButton,
          {
            borderColor: Colors[colorKey].border,
            backgroundColor: Colors[colorKey].background,
          },
        ]}
      >
        <Ionicons name="help-circle-outline" size={14} color={Colors[colorKey].tint} />
        <Text style={[styles.triggerText, { color: Colors[colorKey].notification }]}>{triggerText}</Text>
      </Pressable>

      {isReady ? (
        <Modal
          animationType="fade"
          transparent
          visible={isVisible}
          onRequestClose={handleClose}
        >
          <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: Colors[colorKey].card,
                  borderColor: Colors[colorKey].border,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors[colorKey].tint} />
                  <Text style={[styles.modalTitle, { color: Colors[colorKey].text }]}>{title}</Text>
                </View>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={18} color={Colors[colorKey].notification} />
                </Pressable>
              </View>

              <Text style={[styles.modalDescription, { color: Colors[colorKey].notification }]}>
                {description}
              </Text>

              <ScrollView style={styles.sectionScroll} contentContainerStyle={styles.sectionScrollContent}>
                {sections.map((section) => (
                  <View
                    key={section.id}
                    style={[
                      styles.sectionCard,
                      {
                        borderColor: Colors[colorKey].border,
                        backgroundColor: Colors[colorKey].background,
                      },
                    ]}
                  >
                    <Text style={[styles.sectionTitle, { color: Colors[colorKey].text }]}>{section.title}</Text>
                    <Text style={[styles.sectionDescription, { color: Colors[colorKey].notification }]}>
                      {section.description}
                    </Text>
                    {section.steps.map((step) => (
                      <View key={`${section.id}-${step}`} style={styles.stepRow}>
                        <Text style={[styles.stepBullet, { color: Colors[colorKey].tint }]}>•</Text>
                        <Text style={[styles.stepText, { color: Colors[colorKey].text }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.footerRow}>
                <Pressable
                  onPress={handleClose}
                  style={[
                    styles.secondaryButton,
                    {
                      borderColor: Colors[colorKey].border,
                      backgroundColor: Colors[colorKey].background,
                    },
                  ]}
                >
                  <Text style={[styles.secondaryButtonText, { color: Colors[colorKey].notification }]}>
                    Close
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void handleMarkSeen();
                  }}
                  style={[styles.primaryButton, { backgroundColor: Colors[colorKey].tint }]}
                >
                  <Text style={styles.primaryButtonText}>Got it</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.38)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "86%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  modalDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  sectionScroll: {
    flexGrow: 0,
  },
  sectionScrollContent: {
    gap: 8,
    paddingBottom: 6,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  sectionDescription: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 5,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 2,
  },
  stepBullet: {
    marginTop: 1,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
