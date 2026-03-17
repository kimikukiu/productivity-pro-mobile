import { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.userBubbleText : styles.assistantBubbleText,
          ]}
        >
          {message.content}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "WHOAMI-GPT ONLINE\n\nNeural mesh synchronized. Ready to assist with task management, research, problem-solving, and productivity optimization. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const chatMutation = trpc.ai.chat.useMutation();

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || loading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        messages: [
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
          { role: "user", content: String(inputText) },
        ],
      });

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: String(response.message),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: String(response.message || "Error processing request"),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `[ERROR] ${error.message || "Failed to get response"}. Attempting auto-repair...`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  }, [inputText, messages, loading, chatMutation]);

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content:
          "WHOAMI-GPT ONLINE\n\nNeural mesh synchronized. Ready to assist with task management, research, problem-solving, and productivity optimization. How can I help you today?",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScreenContainer containerClassName="bg-[#0a0e17]" edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>WHOAMI-GPT</Text>
            <Text style={styles.headerSubtitle}>Quantum Intelligence Module</Text>
          </View>
          <Pressable
            onPress={handleClearChat}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <IconSymbol name="trash.fill" size={20} color="#ff3b5c" />
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask WHOAMI-GPT..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              editable={!loading}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!inputText.trim() || loading}
              style={({ pressed }) => [
                styles.sendButton,
                (!inputText.trim() || loading) && { opacity: 0.4 },
                pressed && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#00ff88" />
              ) : (
                <IconSymbol name="arrow.up.circle.fill" size={24} color="#00ff88" />
              )}
            </Pressable>
          </View>
          <Text style={styles.charCount}>
            {inputText.length}/500
          </Text>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ff00ff",
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: 1,
    marginTop: 2,
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  bubbleContainer: {
    marginVertical: 6,
    flexDirection: "row",
  },
  userBubbleContainer: {
    justifyContent: "flex-end",
  },
  assistantBubbleContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: "#00ff8820",
    borderWidth: 1,
    borderColor: "#00ff8840",
  },
  assistantBubble: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userBubbleText: {
    color: "#e0e7ff",
  },
  assistantBubbleText: {
    color: "#e0e7ff",
  },
  timestamp: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: "#e0e7ff",
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    padding: 4,
  },
  charCount: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 6,
  },
});
