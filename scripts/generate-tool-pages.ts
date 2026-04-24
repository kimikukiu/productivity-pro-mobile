import * as fs from "fs";
import * as path from "path";
import { ALL_TOOLS } from "../lib/tools-data";

const TOOLS_DIR = path.join(process.cwd(), "app", "tools");

// Create tools directory if it doesn't exist
if (!fs.existsSync(TOOLS_DIR)) {
  fs.mkdirSync(TOOLS_DIR, { recursive: true });
}

// Generate tool page template
function generateToolPage(toolId: string, toolName: string, toolDescription: string, category: string) {
  return `import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ${toolId.replace(/-/g, "_")}Screen() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useColors();

  const handleExecute = async () => {
    if (!input) {
      Alert.alert("Error", "Please enter input");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual tool execution
      setOutput(\`[${toolName}] Executed with input: \${input}\`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
              <Text className="text-primary">← Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">${toolName}</Text>
            <Text className="text-sm text-muted">${toolDescription}</Text>
            <Text className="text-xs text-muted">Category: ${category}</Text>
          </View>

          {/* Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Input</Text>
            <TextInput
              placeholder="Enter parameters..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              editable={!isLoading}
            />
          </View>

          {/* Execute Button */}
          <TouchableOpacity
            onPress={handleExecute}
            disabled={isLoading}
            className={\`py-3 px-4 rounded-lg \${isLoading ? "bg-muted opacity-50" : "bg-primary"}\`}
          >
            <Text className="text-center font-semibold text-background">
              {isLoading ? "Executing..." : "Execute"}
            </Text>
          </TouchableOpacity>

          {/* Output */}
          {output && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Output</Text>
              <View className="bg-surface border border-border rounded-lg p-3">
                <Text className="text-sm text-foreground font-mono">{output}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
`;
}

// Generate all tool pages
let generatedCount = 0;
ALL_TOOLS.forEach((tool) => {
  const toolId = tool.id.replace(/\s+/g, "-").toLowerCase();
  const filePath = path.join(TOOLS_DIR, `${toolId}.tsx`);
  
  const content = generateToolPage(toolId, tool.name, tool.description, tool.category);
  fs.writeFileSync(filePath, content);
  generatedCount++;
});

console.log(`✅ Generated ${generatedCount} tool pages in ${TOOLS_DIR}`);
