import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { ScreenContainer } from "@/components/screen-container";

export default function GenericToolPanel() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Text style={{ color: "#00ff88", fontSize: 16 }}>{"< BACK"}</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Tool Panel</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Tool Control Panel</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>PARAMETERS</Text>
        </View>
        <View style={[styles.inputGroup, { marginTop: 12 }]}>
          <Text style={[styles.label, { color: colors.muted }]}>Input</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput placeholder="Enter input..." placeholderTextColor={colors.muted} style={{ color: colors.foreground, fontFamily: "monospace", fontSize: 13, padding: 12 }} multiline />
          </View>
        </View>
        <Pressable style={({ pressed }) => [styles.executeBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.executeText}>EXECUTE</Text>
        </Pressable>
        <View style={[styles.section, { borderBottomColor: colors.border, marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>RESULTS</Text>
        </View>
        <View style={[styles.resultBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, fontFamily: "monospace", fontSize: 12 }}>Results will appear here...</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "#333" },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "monospace", marginTop: 8 },
  subtitle: { fontSize: 11, fontFamily: "monospace", marginTop: 2 },
  section: { paddingVertical: 12, borderBottomWidth: 0.5 },
  sectionTitle: { fontSize: 11, fontFamily: "monospace", fontWeight: "700" },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 11, fontFamily: "monospace", marginBottom: 6 },
  inputBox: { borderRadius: 8, borderWidth: 1 },
  executeBtn: { backgroundColor: "#00ff88", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 16 },
  executeText: { color: "#0a0e14", fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
  resultBox: { borderRadius: 8, borderWidth: 1, padding: 12, minHeight: 200, marginTop: 12 },
});
