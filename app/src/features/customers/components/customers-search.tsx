import { StyleSheet, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type CustomersSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CustomersSearch({ value, onChange }: CustomersSearchProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrap}>
      <Search size={16} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Buscar por nome"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="words"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
    },
    input: {
      flex: 1,
      height: "100%",
      fontSize: 14,
      color: colors.text,
    },
  });
