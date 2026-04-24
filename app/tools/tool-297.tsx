import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function Tool297Screen() {
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
      setOutput(`[Tool-297] Executed: ${input}`);
    } catch (error) {
      Alert.alert("Error", String(error));
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
          <Text className="text-2xl font-bold text-foreground">Tool 297</Text>
          <Text className="text-sm text-muted">Advanced Security Tool</Text>
          
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
