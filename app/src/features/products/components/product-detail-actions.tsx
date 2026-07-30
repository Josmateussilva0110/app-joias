import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil } from "lucide-react-native";
import { ProductResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { ProductDeleteAction } from "@/features/products/components/product-delete-action";

type ProductDetailActionsProps = {
  product: ProductResponse;
  onEdit: () => void;
  onDeleted?: () => void;
};

export function ProductDetailActions({
  product,
  onEdit,
  onDeleted,
}: ProductDetailActionsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onEdit} activeOpacity={0.85}>
        <LinearGradient
          colors={[colors.primary, "#9A7840"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Pencil size={18} color={colors.onPrimary} />
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
            Editar venda
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <ProductDeleteAction product={product} onDeleted={onDeleted} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 24,
      paddingTop: 0,
      gap: 12,
    },
    primaryButton: {
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
