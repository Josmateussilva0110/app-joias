import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { useListLayout } from "@/hooks/use-list-layout";

interface ToggleRowProps {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ icon: Icon, label, hint, value, onChange }: ToggleRowProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();

  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
      style={[
        styles.row,
        isCompact && styles.rowCompact,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: value ? `${colors.primary}50` : colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        <Icon
          size={isCompact ? 18 : 20}
          color={value ? colors.primary : colors.textSecondary}
          style={styles.icon}
        />
        <View style={styles.textWrap}>
          <Text
            style={[styles.label, isCompact && styles.labelCompact, { color: colors.text }]}
            numberOfLines={2}
          >
            {label}
          </Text>
          <Text
            style={[styles.hint, isCompact && styles.hintCompact, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {hint}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: value ? colors.primary : colors.border },
        ]}
      >
        <View style={[styles.thumb, value && styles.thumbActive]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
    maxWidth: "100%",
  },
  rowCompact: {
    padding: 14,
    gap: 10,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  icon: {
    flexShrink: 0,
    marginTop: 1,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  labelCompact: {
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  hintCompact: {
    fontSize: 11,
    lineHeight: 16,
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
    flexShrink: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  thumbActive: {
    alignSelf: "flex-end",
  },
});
