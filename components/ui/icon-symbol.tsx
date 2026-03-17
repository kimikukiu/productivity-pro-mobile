// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "list.bullet": "list",
  "bolt.fill": "flash-on",
  "terminal.fill": "terminal",
  "gearshape.fill": "settings",
  "plus.circle.fill": "add-circle",
  "checkmark.circle.fill": "check-circle",
  "trash.fill": "delete",
  "xmark.circle.fill": "cancel",
  "arrow.up.circle.fill": "send",
  "magnifyingglass": "search",
  "square.grid.2x2": "grid-3x3",
  "square.grid.3x3": "grid-view",
  "slider.horizontal.3": "tune",
  "bell.fill": "notifications-active",
  "shield.fill": "security",
  "lock.fill": "lock",
  "unlock.fill": "lock-open",
  "key.fill": "vpn-key",
  "wifi": "wifi",
  "network": "router",
  "cloud": "cloud",
  "server.rack": "storage",
  "terminal": "terminal",
  "command": "code",
  "wrench.fill": "build",
  "hammer.fill": "build",
  "lightbulb.fill": "lightbulb",
  "star.fill": "star",
  "heart.fill": "favorite",
  "bookmark.fill": "bookmark",
  "flag.fill": "flag",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "questionmark.circle.fill": "help",
  "checkmark": "check",
  "xmark": "close",
  "minus": "remove",
  "plus": "add",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "ellipsis": "more-vert",
  "ellipsis.circle": "more-vert",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "pencil": "edit",
  "pencil.circle": "edit",
  "square.and.arrow.up": "share",
  "doc.fill": "description",
  "folder.fill": "folder",
  "photo.fill": "image",
  "video.fill": "videocam",
  "music.note": "music-note",
  "play.circle.fill": "play-circle",
  "pause.circle.fill": "pause-circle",
  "stop.circle.fill": "stop-circle",
  "speaker.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  "mic.fill": "mic",
  "mic.slash.fill": "mic-off",
  "phone.fill": "phone",
  "envelope.fill": "mail",
  "mappin.circle.fill": "location-on",
  "calendar": "calendar-today",
  "clock.fill": "schedule",
  "timer": "timer",
  "stopwatch.fill": "timer",
  "person.fill": "person",
  "person.2.fill": "people",
  "person.crop.circle.fill": "account-circle",
  "creditcard.fill": "credit-card",
  "dollarsign.circle.fill": "attach-money",
  "chart.bar.fill": "bar-chart",
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.pie.fill": "pie-chart",
  "graph": "show-chart",
  "arrow.up.right": "trending-up",
  "arrow.down.right": "trending-down",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
