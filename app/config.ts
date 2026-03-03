/**
 * @file app/config.ts
 * @description Centralized configuration driven by environment variables.
 * Labels are in English for future i18n implementation.
 */
const APP_CONFIG = {
  // --- MEDIA & SCAN SETTINGS ---
  media: {
    scanLimit: Number(process.env.EXPO_PUBLIC_MEDIA_LIMIT) || 500,
  },

  // --- CARDS DECK PHYSICS ---
  deck: {
    swipeThreshold: Number(process.env.EXPO_PUBLIC_SWIPE_THRESHOLD) || 0.3,
    maxOverlayOpacity: Number(process.env.EXPO_PUBLIC_OVERLAY_MAX_OPACITY) || 0.75,
    overlayMaxWidthRatio: Number(process.env.EXPO_PUBLIC_OVERLAY_MAX_WIDTH_RATIO) || 0.3,
    backCardScale: Number(process.env.EXPO_PUBLIC_BACK_CARD_SCALE) || 0.985,
  },

  // --- VIDEO PLAYER SETTINGS ---
  video: {
    timeUpdateInterval: Number(process.env.EXPO_PUBLIC_VIDEO_TIME_INTERVAL) || 0.1,
    shouldLoop: process.env.EXPO_PUBLIC_VIDEO_LOOP === "true",
    contentFit: "cover" as const,
  },

  // --- DECISION COLORS & ICONS ---
  decisions: {
    trash: {
      color: process.env.EXPO_PUBLIC_COLOR_TRASH || "#FF3B30",
      icon: "trash-bin-outline" as const,
      label: "Trash",
    },
    keep: {
      color: process.env.EXPO_PUBLIC_COLOR_KEEP || "#34C759",
      icon: "heart-outline" as const,
      label: "Keep",
    },
    restore: {
      color: process.env.EXPO_PUBLIC_COLOR_RESTORE || "#007AFF",
      icon: "home" as const,
      label: "Restore",
    },
  },

  // --- NAVIGATION (TABS) ---
  tabs: {
    height: Number(process.env.EXPO_PUBLIC_TAB_HEIGHT) || 65,
    bottom: Number(process.env.EXPO_PUBLIC_TAB_BOTTOM_OFFSET) || 24,
    activeTintColor: process.env.EXPO_PUBLIC_TAB_ACTIVE_COLOR || "#FF3B30",
    inactiveTintColor: process.env.EXPO_PUBLIC_TAB_INACTIVE_COLOR || "#8E8E93",
    routes: {
      trash: {
        name: "TrashTab",
        label: "trash",
        icon: "trash-bin-outline" as const,
      },
      home: {
        name: "HomeTab",
        label: "home",
        icon: "home" as const,
      },
      keep: {
        name: "ApprovedTab",
        label: "keep",
        icon: "heart-outline" as const,
      },
    },
  },
};

export default APP_CONFIG;

export type AppConfig = typeof APP_CONFIG;
