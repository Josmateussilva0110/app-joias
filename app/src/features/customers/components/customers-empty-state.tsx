import { StyleSheet, Text, View } from "react-native";
import { UserRound } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function CustomersEmptyState() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <UserRound size={28} color={colors.emptyIcon} strokeWidth={1.75} />
      </View>
      <Text style={styles.title}>Nenhum cliente cadastrado</Text>
      <Text style={styles.description}>
        Toque no botão + para cadastrar seu primeiro cliente.
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 32,
      borderRadius: 22,
      borderWidth: 1,
      backgroundColor: colors.emptyBg,
      borderColor: colors.emptyBorder,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.emptyIconBg,
    },
    title: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: "800",
      color: colors.emptyTitle,
      textAlign: "center",
    },
    description: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.emptyDescription,
      textAlign: "center",
    },
  });
