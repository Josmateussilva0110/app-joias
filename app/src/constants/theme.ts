import "@/global.css";

import { Platform } from "react-native";

/** Dourado antigo — cor principal da marca */
const PRIMARY_LIGHT = "#B8954A";
const PRIMARY_DARK = "#D4B978";

/** Borgonha / rose gold — detalhes e destaques */
const ACCENT_LIGHT = "#8B4D57";
const ACCENT_DARK = "#C4888F";

const ERROR = "#C45C5C";

export const Colors = {
  light: {
    text: "#1A1612",
    background: "#FBF8F4",

    card: "#F5F0E8",
    border: "#E9E0D4",

    backgroundElement: "#F5F0E8",
    backgroundSelected: "#E9E0D4",
    textSecondary: "#6E655C",

    primary: PRIMARY_LIGHT,
    primaryMuted: "#F3EBD9",
    accent: ACCENT_LIGHT,
    accentMuted: "#F5E8EA",
    onPrimary: "#FFFBF5",
    error: ERROR,

    shellBackground: "#FBF8F4",
    headerGradientStart: "#FBF8F4",
    headerGradientEnd: "#F5EDE0",
    headerBorder: "#E9E0D4",

    authGradientStart: "#FBF8F4",
    authGradientEnd: "#F0E6D6",

    statusBarStyle: "dark-content" as const,

    summaryGradientStart: "#FBF5EB",
    summaryGradientMid: "#F5EBD4",
    summaryGradientEnd: "#FAF6F0",

    summaryValue: "#5C4A1F",
    summaryLabel: "#9A7840",

    summaryDecorCircle: "#B8954A20",

    summaryItemBadgeBg: "#F3EBD9",
    summaryItemBadgeBorder: "#D4B97860",
    summaryItemBadgeText: "#8A6D2F",

    alertTextDanger: "#B91C1C",
    alertTextSuccess: "#9A7840",

    sectionTitleColor: "#1A1612",

    cardBackground: "#FFFBF5",
    cardBorderDefault: "#E9E0D4",
    cardName: "#1A1612",
    cardPrice: "#6E655C",
    cardDeleteBg: "#F5F0E8",
    cardDeleteIcon: "#8A8278",
    cardChevron: "#B8AFA4",

    emptyBg: "#FAF7F2",
    emptyBorder: "#E9E0D4",
    emptyIconBg: "#F5F0E8",
    emptyIcon: "#B8AFA4",
    emptyTitle: "#1A1612",
    emptyDescription: "#8A8278",
    emptyButtonBg: PRIMARY_LIGHT,

    fabGradientStart: "#C6A75E",
    fabGradientEnd: PRIMARY_LIGHT,

    filterChipBg: "#F5F0E8",
    filterChipBorder: "#E9E0D4",
    filterChipText: "#1A1612",
    filterChipActiveText: "#FFFBF5",

    success: "#9A7840",
    warning: "#D97706",
    danger: ERROR,
    info: "#6B7280",

    userBadgeBg: "#F5F0E8",
    userBadgeText: "#1A1612",
    userBadgeIcon: "#6E655C",
  },

  dark: {
    text: "#FAF6F0",
    background: "#0C0A09",

    card: "#1A1612",
    border: "#2C2620",

    backgroundElement: "#1A1612",
    backgroundSelected: "#2C2620",
    textSecondary: "#A69888",

    primary: PRIMARY_DARK,
    primaryMuted: "#D4B97818",
    accent: ACCENT_DARK,
    accentMuted: "#3D2528",
    onPrimary: "#1A1612",
    error: "#F87171",

    shellBackground: "#0C0A09",
    headerGradientStart: "#0C0A09",
    headerGradientEnd: "#16120F",
    headerBorder: "#2C2620",

    authGradientStart: "#0C0A09",
    authGradientEnd: "#1A1410",

    statusBarStyle: "light-content" as const,

    summaryGradientStart: "#1A1410",
    summaryGradientMid: "#221C16",
    summaryGradientEnd: "#0F0D0B",

    summaryValue: "#FAF6F0",
    summaryLabel: PRIMARY_DARK,

    summaryDecorCircle: "#D4B97820",

    summaryItemBadgeBg: "#2A2418",
    summaryItemBadgeBorder: "#D4B97840",
    summaryItemBadgeText: PRIMARY_DARK,

    alertTextDanger: "#F87171",
    alertTextSuccess: PRIMARY_DARK,

    sectionTitleColor: "#FAF6F0",

    cardBackground: "#141110",
    cardBorderDefault: "#2C2620",
    cardName: "#FAF6F0",
    cardPrice: "#A69888",
    cardDeleteBg: "#1F1B18",
    cardDeleteIcon: "#A69888",
    cardChevron: "#4A433C",

    emptyBg: "#11100E",
    emptyBorder: "#2C2620",
    emptyIconBg: "#1A1612",
    emptyIcon: "#4A433C",
    emptyTitle: "#FAF6F0",
    emptyDescription: "#6E655C",
    emptyButtonBg: PRIMARY_DARK,

    fabGradientStart: PRIMARY_DARK,
    fabGradientEnd: "#B8954A",

    filterChipBg: "#1A1612",
    filterChipBorder: "#2C2620",
    filterChipText: "#FAF6F0",
    filterChipActiveText: "#1A1612",

    success: PRIMARY_DARK,
    warning: "#FBBF24",
    danger: "#F87171",
    info: "#94A3B8",

    userBadgeBg: "#1A1612",
    userBadgeText: "#FAF6F0",
    userBadgeIcon: "#A69888",
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light &
  keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
