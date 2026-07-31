import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { Search, type LucideIcon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useListLayout } from "@/hooks/use-list-layout";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChange,
  placeholder,
  icon: Icon = Search,
  autoCapitalize = "words",
  style,
}: SearchBarProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isCompact);

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
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
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
  });
