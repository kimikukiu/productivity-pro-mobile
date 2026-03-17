import { ScrollView, Text, View, Pressable, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useModules, MODULES } from "@/lib/modules-context";
import { useState } from "react";

export default function ModulesScreen() {
  const { setActiveModule, searchModules } = useModules();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredModules = searchQuery
    ? searchModules(searchQuery)
    : selectedCategory
      ? MODULES.filter((m) => m.category === selectedCategory)
      : MODULES;

  const categories = ["offensive", "intel", "utility", "ai", "telegram", "zr_repos"];

  return (
    <ScreenContainer className="bg-background flex flex-col">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b border-border">
        <Text className="text-2xl font-bold text-primary mb-3 font-mono">MODULES</Text>

        {/* Search */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search 370+ tools..."
          placeholderTextColor="#6b7280"
          style={{
            backgroundColor: "#111827",
            color: "#e0e7ff",
            borderColor: "#1e293b",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontFamily: "monospace",
            fontSize: 12,
            marginBottom: 12,
          }}
        />

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: !selectedCategory ? "#00ff88" : "#1e293b",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className={`text-xs font-bold font-mono ${
                !selectedCategory ? "text-background" : "text-foreground"
              }`}
            >
              ALL
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: selectedCategory === cat ? "#00ff88" : "#1e293b",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                className={`text-xs font-bold font-mono uppercase ${
                  selectedCategory === cat ? "text-background" : "text-foreground"
                }`}
              >
                {cat.replace("_", " ")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Modules Grid */}
      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
        {filteredModules.map((module) => (
          <Pressable
            key={module.id}
            onPress={() => setActiveModule(module)}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#1a2332" : "#111827",
                borderColor: module.color,
                borderWidth: 1.5,
                borderRadius: 8,
                padding: 12,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text
                  className="text-sm font-bold font-mono mb-1"
                  style={{ color: module.color }}
                >
                  {module.name}
                </Text>
                <Text className="text-xs text-muted mb-2">{module.description}</Text>
                <View className="flex-row gap-2 items-center">
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: module.color + "20" }}
                  >
                    <Text className="text-xs font-mono" style={{ color: module.color }}>
                      {module.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: module.color,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-xs font-bold text-background">EXEC</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}

        {filteredModules.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-muted text-center">No modules found</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="border-t border-border px-4 py-3 bg-surface">
        <Text className="text-xs text-muted text-center font-mono">
          {filteredModules.length} modules available
        </Text>
      </View>
    </ScreenContainer>
  );
}
