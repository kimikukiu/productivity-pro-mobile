import { ScrollView, Text, View, TextInput, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef, useEffect } from "react";

interface ConsoleLog {
  id: string;
  type: "command" | "success" | "info" | "warning" | "error";
  text: string;
  timestamp: string;
}

export default function ConsoleScreen() {
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: "1",
      type: "info",
      text: "WHOAMI@C2:~$ Neural Console initialized. Version 8.6.0-PRO",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      type: "success",
      text: "[SUCCESS] System initialized. Neural mesh online.",
      timestamp: new Date().toISOString(),
    },
    {
      id: "3",
      type: "info",
      text: "[INFO] C2 Master Session established. Version 8.6.0-PRO.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const getLogColor = (type: string) => {
    switch (type) {
      case "success":
        return "#00ff88";
      case "error":
        return "#ff3b5c";
      case "warning":
        return "#ffff00";
      case "info":
        return "#00e5ff";
      case "command":
        return "#e0e7ff";
      default:
        return "#6b7280";
    }
  };

  const handleExecuteCommand = () => {
    if (!input.trim()) return;

    const timestamp = new Date().toISOString();
    const commandLog: ConsoleLog = {
      id: Date.now().toString(),
      type: "command",
      text: `WHOAMI@C2:~$ ${input}`,
      timestamp,
    };

    setLogs((prev) => [...prev, commandLog]);

    setTimeout(() => {
      const resultLog: ConsoleLog = {
        id: (Date.now() + 1).toString(),
        type: "success",
        text: `[${new Date(timestamp).toLocaleTimeString()}] [SYSTEM] Command executed successfully.`,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [...prev, resultLog]);
    }, 500);

    setInput("");
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  return (
    <ScreenContainer className="bg-background flex flex-col">
      <View className="px-4 pt-4 pb-3 border-b border-border">
        <Text className="text-2xl font-bold text-primary mb-1 font-mono">[ TERMINAL_CONSOLE ]</Text>
        <Text className="text-xs text-muted">C2_MASTER_SESSION_800K</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4 bg-background"
        contentContainerStyle={{ gap: 4, paddingBottom: 20 }}
      >
        {logs.map((log) => (
          <Text
            key={log.id}
            className="text-xs font-mono leading-relaxed"
            style={{ color: getLogColor(log.type) }}
          >
            {log.text}
          </Text>
        ))}
      </ScrollView>

      <View className="border-t border-border px-4 py-4 gap-3">
        <View className="flex-row gap-2 items-center">
          <Text className="text-xs font-mono text-success">WHOAMI@C2:~$</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Enter command..."
            placeholderTextColor="#6b7280"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              color: "#e0e7ff",
              fontFamily: "monospace",
              fontSize: 12,
              paddingVertical: 8,
              borderBottomColor: "#1e293b",
              borderBottomWidth: 1,
            }}
            onSubmitEditing={handleExecuteCommand}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleExecuteCommand}
            disabled={!input.trim()}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 4,
                backgroundColor: !input.trim() ? "#666" : pressed ? "#00cc6a" : "#00ff88",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text className="text-xs font-bold text-background">EXEC</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setLogs([])}
          style={({ pressed }) => [
            {
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 4,
              backgroundColor: pressed ? "#cc0000" : "#ff3b5c",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text className="text-xs font-bold text-background text-center">CLEAR CONSOLE</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
