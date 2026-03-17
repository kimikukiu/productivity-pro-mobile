# Productivity Pro — Mobile App Design Document

## Design Philosophy

A personal productivity tool with a dark, hacker-style "command center" aesthetic inspired by the WHOAMISec Pro dashboard. The app feels like a cyberpunk mission control — tasks are "missions," progress is tracked through system-style indicators, and activity is logged in a terminal console. The design targets mobile portrait orientation (9:16) and one-handed usage, following Apple HIG principles while maintaining the unique visual identity.

---

## Screen List

### 1. Dashboard (Home)
The main command center view. Shows an overview of productivity stats, active tasks, and a quick-add action.

**Primary Content:**
- Header: "COMMAND CENTER" title with animated status indicator
- Stats row: 4 metric cards (Active Tasks, Completed Today, Streak Days, Focus Score)
- Active Missions section: Top 3 priority tasks displayed as mission cards
- System Status: Progress bars for daily goal completion
- Quick Action FAB: Floating button to add new task

### 2. Tasks Screen
Full task management view with categories and filtering.

**Primary Content:**
- Segmented control: All / Active / Completed
- Task list using FlatList with swipe actions (complete, delete)
- Each task card shows: title, priority indicator (color-coded), due date, category tag
- Category filter chips at top
- Empty state with terminal-style message

### 3. Activity Log Screen
Terminal-style scrolling log of all completed actions and system events.

**Primary Content:**
- Terminal header with session info
- Chronological list of events with timestamps
- Color-coded entries: task completed (green), task created (cyan), task deleted (red)
- Stats summary at top (today's activity count)

### 4. Settings Screen
App configuration and stats overview.

**Primary Content:**
- System Info section (app version, total tasks, etc.)
- Theme toggle (dark mode only for this app — always dark)
- Notification preferences
- Data management (clear completed tasks, export data)
- About section

---

## Key User Flows

### Create a Task
1. User taps "+" FAB on Dashboard → Modal slides up
2. User enters task title (required)
3. User selects priority (Low/Medium/High/Critical) via color-coded buttons
4. User optionally sets due date and category
5. User taps "DEPLOY" button → Task created with haptic feedback
6. Modal dismisses → Dashboard updates with new task

### Complete a Task
1. User views task in Tasks screen or Dashboard
2. User taps the checkbox or swipes right on task card
3. Task animates to "completed" state with green glow
4. Success haptic fires
5. Activity log receives new entry
6. Dashboard stats update

### View Activity History
1. User navigates to Activity Log tab
2. Sees terminal-style scrolling log
3. Each entry shows timestamp, action type, and task name
4. Can scroll through full history

---

## Color Choices

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| background | #0a0e17 | #0a0e17 | Deep navy-black base |
| surface | #111827 | #111827 | Card/elevated surfaces |
| foreground | #e0e7ff | #e0e7ff | Primary text (soft white-blue) |
| muted | #6b7280 | #6b7280 | Secondary text |
| primary | #00ff88 | #00ff88 | Main accent (neon green) |
| border | #1e293b | #1e293b | Subtle borders |
| success | #00ff88 | #00ff88 | Completed/success states |
| warning | #fbbf24 | #fbbf24 | Medium priority / warnings |
| error | #ff3b5c | #ff3b5c | High priority / errors |

Additional custom colors (not in theme tokens, used inline):
- Cyan accent: #00e5ff (info, created events)
- Magenta accent: #ff00ff (critical priority)
- Neon yellow: #e5ff00 (streak/focus highlights)

---

## Typography

- Headers: System bold, uppercase with letter-spacing for "terminal" feel
- Body: System regular
- Monospace elements: Use Platform.select for monospace font (Courier on iOS, monospace on Android)

---

## Navigation

- Bottom tab bar with 4 tabs: Dashboard, Tasks, Activity, Settings
- Tab icons: home (dashboard), list (tasks), terminal (activity), gear (settings)
- Dark tab bar matching the app background
- Neon green active tab indicator

---

## Interaction Patterns

- Haptic feedback on task creation, completion, and deletion
- Subtle scale animations on card press (0.97)
- Swipe-to-complete and swipe-to-delete on task items
- Pull-to-refresh on task list (re-sorts by priority)
- FAB with press scale animation for quick task creation
