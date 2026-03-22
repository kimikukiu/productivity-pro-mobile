const fs = require("fs");
const path = require("path");

const toolsDir = path.join(__dirname, "app", "tools");
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
}

// Load tools
let allTools = [];
try {
  const db = JSON.parse(fs.readFileSync("/tmp/whm-repos-real/training_database_final.json", "utf8"));
  allTools = db.tools || [];
} catch (e) {
  console.log("Warning: Could not load training database");
}

console.log(`Generating ${Math.min(370, allTools.length)} tool pages...`);

for (let i = 0; i < Math.min(370, allTools.length); i++) {
  const tool = allTools[i];
  const toolName = tool.name || `Tool ${i}`;
  const toolDesc = (tool.description || "").replace(/"/g, '\\"');
  const toolCat = tool.category || "Other";

  const content = `import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function Tool${i}Screen() {
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
      setOutput(\`[\${toolName}] Executed with: \${input}\`);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">${toolName}</Text>
          <Text className="text-sm text-muted">${toolDesc}</Text>
          <Text className="text-xs text-muted">Category: ${toolCat}</Text>
          
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
          
          <TouchableOpacity
            onPress={handleExecute}
            disabled={isLoading}
            className="py-3 px-4 rounded-lg bg-primary"
          >
            <Text className="text-center font-semibold text-background">
              {isLoading ? "Executing..." : "Execute"}
            </Text>
          </TouchableOpacity>
          
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

  fs.writeFileSync(path.join(toolsDir, `tool-${i}.tsx`), content);
  if ((i + 1) % 50 === 0) console.log(`Generated ${i + 1} pages...`);
}

console.log(`✅ Generated ${Math.min(370, allTools.length)} tool pages!`);
