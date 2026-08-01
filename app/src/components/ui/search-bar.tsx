import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Search, X, type LucideIcon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useListLayout } from "@/hooks/use-list-layout";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  icon: Icon = Search,
  autoCapitalize = "words",
  style,
}: SearchBarProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isCompact);
  const showClear = value.length > 0;

  const handleClear = () => {
    onChange("");
    onSubmit?.("");
  };

  return (
    <View style={[styles.wrap, style]}>
      <Icon size={isCompact ? 14 : 15} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType="search"
        blurOnSubmit={false}
        onSubmitEditing={() => onSubmit?.(value)}
        onBlur={() => {
          if (!value.trim()) {
            onSubmit?.("");
          }
        }}
        style={styles.input}
      />
      {showClear ? (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          style={styles.clearButton}
        >
          <X size={isCompact ? 14 : 15} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    wrap: {
      alignSelf: "stretch",
      width: "100%",
      minWidth: 0,
      height: isCompact ? 36 : 38,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: isCompact ? 10 : 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
    },
    input: {
      flex: 1,
      height: "100%",
      fontSize: isCompact ? 13 : 14,
      color: colors.text,
    },
    clearButton: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
