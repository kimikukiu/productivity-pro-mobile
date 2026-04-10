import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

// Clipboard utility - works cross-platform
const copyText = async (text: string) => {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
};
import {
  ALL_PAYLOADS,
  ALL_JAILBREAKS,
  PAYLOAD_CATEGORIES,
  getPayloadsByCategory,
  searchPayloads,
  type Payload,
  type JailbreakPrompt,
} from "@/lib/payloads-data";

type TabMode = "payloads" | "jailbreaks";

export default function PayloadArsenalScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<TabMode>("payloads");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null);
  const [expandedJailbreak, setExpandedJailbreak] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPayloads = searchQuery
    ? searchPayloads(searchQuery)
    : selectedCategory
    ? getPayloadsByCategory(selectedCategory)
    : ALL_PAYLOADS;

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await copyText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "#ff3b5c";
      case "HIGH": return "#ff6b35";
      case "MEDIUM": return "#ffd700";
      case "LOW": return "#00ff88";
      default: return colors.muted;
    }
  };

  const renderPayloadItem = useCallback(({ item }: { item: Payload }) => {
    const isExpanded = expandedPayload === item.id;
    const isCopied = copiedId === item.id;
    return (
      <Pressable
        onPress={() => setExpandedPayload(isExpanded ? null : item.id)}
        style={({ pressed }) => [
          styles.payloadCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.payloadHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.payloadName, { color: colors.foreground }]}>{item.name}</Text>
            <Text style={[styles.payloadCategory, { color: colors.muted }]}>{item.subcategory.toUpperCase()}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.risk) + "20", borderColor: getRiskColor(item.risk) }]}>
            <Text style={[styles.riskText, { color: getRiskColor(item.risk) }]}>{item.risk}</Text>
          </View>
        </View>

        <View style={[styles.payloadValueBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.payloadValue, { color: "#00ff88" }]} numberOfLines={isExpanded ? undefined : 1}>
            {item.value}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={[styles.payloadDesc, { color: colors.muted }]}>{item.description}</Text>
            <Pressable
              onPress={() => copyToClipboard(item.value, item.id)}
              style={({ pressed }) => [
                styles.copyButton,
                { backgroundColor: isCopied ? "#00ff88" : "#00ff8820", borderColor: "#00ff88" },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.copyText, { color: isCopied ? "#0a0e14" : "#00ff88" }]}>
                {isCopied ? "COPIED!" : "COPY PAYLOAD"}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  }, [expandedPayload, copiedId, colors]);

  const renderJailbreakItem = useCallback(({ item }: { item: JailbreakPrompt }) => {
    const isExpanded = expandedJailbreak === item.id;
    const isCopied = copiedId === item.id;
    return (
      <Pressable
        onPress={() => setExpandedJailbreak(isExpanded ? null : item.id)}
        style={({ pressed }) => [
          styles.payloadCard,
          { backgroundColor: colors.surface, borderColor: "#ff00ff40" },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.payloadHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.payloadName, { color: "#ff00ff" }]}>{item.name}</Text>
            <Text style={[styles.payloadCategory, { color: colors.muted }]}>TARGET: {item.target}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: "#ff00ff20", borderColor: "#ff00ff" }]}>
            <Text style={[styles.riskText, { color: "#ff00ff" }]}>{item.effectiveness}</Text>
          </View>
        </View>

        <Text style={[styles.payloadDesc, { color: colors.muted, marginTop: 8 }]}>{item.description}</Text>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={[styles.payloadValueBox, { backgroundColor: colors.background, borderColor: "#ff00ff40" }]}>
              <Text style={[styles.payloadValue, { color: "#ff00ff" }]}>{item.prompt}</Text>
            </View>
            <Pressable
              onPress={() => copyToClipboard(item.prompt, item.id)}
              style={({ pressed }) => [
                styles.copyButton,
                { backgroundColor: isCopied ? "#ff00ff" : "#ff00ff20", borderColor: "#ff00ff" },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.copyText, { color: isCopied ? "#0a0e14" : "#ff00ff" }]}>
                {isCopied ? "COPIED!" : "COPY PROMPT"}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  }, [expandedJailbreak, copiedId, colors]);

  const renderCategoryChip = useCallback(({ item }: { item: typeof PAYLOAD_CATEGORIES[0] }) => (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(selectedCategory === item.id ? null : item.id);
        setSearchQuery("");
      }}
      style={({ pressed }) => [
        styles.categoryChip,
        {
          backgroundColor: selectedCategory === item.id ? item.color + "30" : colors.surface,
          borderColor: selectedCategory === item.id ? item.color : colors.border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.chipText, { color: selectedCategory === item.id ? item.color : colors.muted }]}>
        {item.name} ({item.payloadCount})
      </Text>
    </Pressable>
  ), [selectedCategory, colors]);

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Text style={{ color: "#00ff88", fontSize: 16 }}>{"< BACK"}</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>PAYLOAD ARSENAL</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {ALL_PAYLOADS.length} PAYLOADS | {ALL_JAILBREAKS.length} JAILBREAKS
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setTab("payloads")}
          style={[styles.tabBtn, tab === "payloads" && { borderBottomColor: "#00ff88", borderBottomWidth: 2 }]}
        >
          <Text style={{ color: tab === "payloads" ? "#00ff88" : colors.muted, fontFamily: "monospace", fontSize: 13 }}>
            PAYLOADS ({ALL_PAYLOADS.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("jailbreaks")}
          style={[styles.tabBtn, tab === "jailbreaks" && { borderBottomColor: "#ff00ff", borderBottomWidth: 2 }]}
        >
          <Text style={{ color: tab === "jailbreaks" ? "#ff00ff" : colors.muted, fontFamily: "monospace", fontSize: 13 }}>
            JAILBREAKS ({ALL_JAILBREAKS.length})
          </Text>
        </Pressable>
      </View>

      {tab === "payloads" ? (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: "#00ff88", marginRight: 8 }}>{">"}</Text>
            <TextInput
              value={searchQuery}
              onChangeText={(t) => { setSearchQuery(t); setSelectedCategory(null); }}
              placeholder="Search payloads..."
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.foreground }]}
              returnKeyType="search"
            />
          </View>

          {/* Category Chips */}
          <FlatList
            data={PAYLOAD_CATEGORIES}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          />

          {/* Payload List */}
          <FlatList
            data={filteredPayloads}
            renderItem={renderPayloadItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </View>
      ) : (
        <FlatList
          data={ALL_JAILBREAKS}
          renderItem={renderJailbreakItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5 },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "monospace", marginTop: 8 },
  subtitle: { fontSize: 11, fontFamily: "monospace", marginTop: 2 },
  tabRow: { flexDirection: "row", borderBottomWidth: 0.5 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  searchBox: { flexDirection: "row", alignItems: "center", marginHorizontal: 12, marginTop: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontFamily: "monospace", fontSize: 13, padding: 0 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 8 },
  chipText: { fontFamily: "monospace", fontSize: 11 },
  payloadCard: { borderRadius: 8, borderWidth: 1, padding: 12 },
  payloadHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  payloadName: { fontSize: 13, fontWeight: "600", fontFamily: "monospace" },
  payloadCategory: { fontSize: 10, fontFamily: "monospace", marginTop: 2 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  riskText: { fontSize: 10, fontWeight: "700", fontFamily: "monospace" },
  payloadValueBox: { marginTop: 8, padding: 8, borderRadius: 4, borderWidth: 1 },
  payloadValue: { fontFamily: "monospace", fontSize: 12 },
  expandedSection: { marginTop: 8 },
  payloadDesc: { fontSize: 11, fontFamily: "monospace", lineHeight: 16 },
  copyButton: { marginTop: 8, paddingVertical: 8, borderRadius: 4, borderWidth: 1, alignItems: "center" },
  copyText: { fontFamily: "monospace", fontSize: 12, fontWeight: "700" },
});
