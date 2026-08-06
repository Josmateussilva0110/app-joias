import { useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Check } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useListLayout } from "@/hooks/use-list-layout";

type FilterChipOption<T extends string> = {
  value: T;
  label: string;
};

type FilterChipProps<T extends string> = {
  label: string;
  value: T;
  options: FilterChipOption<T>[];
  onChange: (value: T) => void;
  active?: boolean;
  variant?: "default" | "dock";
};

export function FilterChip<T extends string>({
  label,
  value,
  options,
  onChange,
  active = false,
  variant = "default",
}: FilterChipProps<T>) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isCompact, variant);
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? label;

  return (
    <>
      <AnimatedPressable
        onPress={() => setOpen(true)}
        style={[styles.chip, active && styles.chipActive]}
      >
        {variant === "dock" ? (
          <Text style={[styles.chipValue, active && styles.chipValueActive]}>
            {selectedLabel}
          </Text>
        ) : (
          <>
            <Text style={styles.chipLabel}>{label}</Text>
            <Text style={styles.chipValue}>{selectedLabel}</Text>
          </>
        )}
      </AnimatedPressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView>
              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {selected ? <Check size={16} color={colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type FilterChipRowProps = {
  children: ReactNode;
  variant?: "default" | "dock";
};

export function FilterChipRow({ children, variant = "default" }: FilterChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        stylesRow.content,
        variant === "dock" && stylesRow.contentDock,
      ]}
    >
      {children}
    </ScrollView>
  );
}

const stylesRow = StyleSheet.create({
  content: {
    gap: 8,
    paddingVertical: 2,
  },
  contentDock: {
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
});

const createStyles = (
  colors: ThemeColors,
  isCompact: boolean,
  variant: "default" | "dock"
) =>
  StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 4 : 6,
      paddingHorizontal:
        variant === "dock" ? (isCompact ? 14 : 16) : isCompact ? 10 : 12,
      paddingVertical:
        variant === "dock" ? (isCompact ? 9 : 10) : isCompact ? 6 : 7,
      borderRadius: 999,
      borderWidth: variant === "dock" ? 0 : 1,
      backgroundColor:
        variant === "dock" ? colors.backgroundElement : colors.backgroundElement,
      borderColor: colors.filterChipBorder,
    },
    chipActive: {
      backgroundColor: variant === "dock" ? colors.primary : colors.primaryMuted,
      borderColor: variant === "dock" ? colors.primary : `${colors.primary}50`,
    },
    chipLabel: {
      fontSize: isCompact ? 10 : 11,
      fontWeight: "700",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    chipValue: {
      fontSize: variant === "dock" ? (isCompact ? 13 : 14) : isCompact ? 12 : 13,
      fontWeight: variant === "dock" ? "600" : "600",
      color: colors.text,
    },
    chipValueActive: {
      color: colors.filterChipActiveText,
      fontWeight: "700",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      maxHeight: "50%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingBottom: 24,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    optionSelected: {
      backgroundColor: colors.primaryMuted,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      fontWeight: "700",
      color: colors.primary,
    },
  });
