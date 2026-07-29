import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChevronDown, Check, type LucideIcon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectFieldProps<T extends string> = {
  label: string;
  icon: LucideIcon;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  placeholder?: string;
  compact?: boolean;
};

export function SelectField<T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  error,
  placeholder = "Selecione",
  compact = false,
}: SelectFieldProps<T>) {
  const { colors } = useTheme();
  const styles = createStyles(colors, compact);
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  function handleSelect(optionValue: T) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <Icon size={16} color={colors.textSecondary} style={styles.icon} />
        <Text
          style={[
            styles.triggerText,
            value ? styles.triggerTextSelected : styles.triggerTextPlaceholder,
          ]}
        >
          {selectedLabel}
        </Text>
        <ChevronDown size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>

            <ScrollView
              style={styles.optionsList}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.7}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {isSelected ? (
                      <Check size={18} color={colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors, compact: boolean) =>
  StyleSheet.create({
    field: {
      gap: compact ? 4 : 6,
    },
    label: {
      fontSize: compact ? 11 : 14,
      fontWeight: compact ? "600" : "500",
      color: compact ? colors.textSecondary : colors.text,
      textTransform: compact ? "uppercase" : "none",
      letterSpacing: compact ? 0.4 : 0,
    },
    trigger: {
      height: compact ? 40 : 52,
      borderRadius: compact ? 10 : 12,
      borderWidth: 1,
      paddingHorizontal: compact ? 10 : 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
    },
    triggerError: {
      borderWidth: 1.5,
      borderColor: colors.error,
    },
    icon: {
      marginRight: 10,
    },
    triggerText: {
      flex: 1,
      fontSize: compact ? 13 : 15,
    },
    triggerTextSelected: {
      color: colors.text,
    },
    triggerTextPlaceholder: {
      color: colors.textSecondary,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
    },
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    sheet: {
      maxHeight: "60%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 24,
      backgroundColor: colors.background,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 24,
      marginBottom: 8,
    },
    optionsList: {
      paddingHorizontal: 12,
    },
    option: {
      minHeight: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
