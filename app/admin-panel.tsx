import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function AdminPanelScreen() {
  const colors = useColors();
  const router = useRouter();

  const adminFeatures = [
    { id: "stats", name: "System Statistics", icon: "📊" },
    { id: "tokens", name: "Token Management", icon: "🔑" },
    { id: "users", name: "User Management", icon: "👥" },
    { id: "settings", name: "System Settings", icon: "⚙️" },
    { id: "monitoring", name: "Health Monitoring", icon: "💚" },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Text style={{ color: "#00ff88", fontSize: 16 }}>{"< BACK"}</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>ADMIN PANEL</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          System administration and control
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {adminFeatures.map((feature) => (
          <Pressable
            key={feature.id}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              // Navigate to specific admin feature
              router.push(`/admin-${feature.id}`);
            }}
            style={({ pressed }) => [
              styles.featureCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureName, { color: colors.foreground }]}>{feature.name}</Text>
            </View>
            <Text style={{ color: colors.muted }}>{">"}</Text>
          </Pressable>
        ))}

        <View style={[styles.sectionHeader, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>SUBSCRIPTION PLANS</Text>
        </View>

        {["Plan 1: 12h Trial (FREE)", "Plan 2: Weekly ($30)", "Plan 3: Monthly ($300)", "Plan 4: Yearly ($1000)"].map((plan, i) => (
          <View key={i} style={[styles.planCard, { backgroundColor: colors.surface, borderColor: "#00ff8860" }]}>
            <Text style={{ color: "#00ff88", fontFamily: "monospace" }}>{plan}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "#333" },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "monospace", marginTop: 8 },
  subtitle: { fontSize: 11, fontFamily: "monospace", marginTop: 2 },
  featureCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  featureIcon: { fontSize: 24, marginRight: 12 },
  featureName: { fontSize: 14, fontWeight: "600", fontFamily: "monospace" },
  sectionHeader: { marginTop: 24, paddingTop: 16, borderTopWidth: 0.5 },
  sectionTitle: { fontSize: 11, fontFamily: "monospace", fontWeight: "700" },
  planCard: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
});

