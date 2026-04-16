import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="control-panel"
        options={{
          title: "Control",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.left.forwardslash.chevron.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="osint"
        options={{
          title: "OSINT",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="repo-control"
        options={{
          title: "Repos",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: "Modules",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "WHOAMI-GPT",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bolt.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="console"
        options={{
          title: "Console",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="terminal.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Config",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="api-keys"
        options={{
          title: "API Keys",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="key.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="api-settings"
        options={{
          title: "LLM Config",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="integrated-tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wrench.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
