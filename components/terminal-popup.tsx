import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface TerminalPopupProps {
  visible: boolean;
  onClose: () => void;
  logs: string[];
}

export default function TerminalPopup({ visible, onClose, logs }: TerminalPopupProps) {
  const [animation] = useState(new Animated.Value(0));
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (scrollRef.current && logs.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [logs]);

  if (!visible) return null;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="terminal" size={16} color="#00ff88" />
          <Text style={styles.title}>LIVE ACTIONS</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={18} color="#ff3b5c" />
        </Pressable>
      </View>

      {/* Terminal Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.terminalContent}
        contentContainerStyle={styles.terminalScrollContent}
      >
        {logs.map((log, index) => (
          <Text key={index} style={styles.logLine}>
            <Text style={styles.prompt}>{' > '}</Text>
            {log}
          </Text>
        ))}
        {logs.length === 0 && (
          <Text style={styles.emptyText}>Waiting for actions...</Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 10,
    right: 10,
    maxHeight: 200,
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#00ff88",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255, 59, 92, 0.1)",
  },
  terminalContent: {
    flex: 1,
    padding: 8,
  },
  terminalScrollContent: {
    flexGrow: 1,
  },
  logLine: {
    color: "#00ff88",
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  prompt: {
    color: "#ffff00",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#666",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});
