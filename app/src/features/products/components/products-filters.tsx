import { StyleSheet, Text, TextInput, View } from "react-native";
import { CalendarDays, CircleDollarSign, Gem, Search } from "lucide-react-native";
import { ProductFilterOptions } from "@app/shared";

import { SelectField } from "@/components/ui/select-field";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  mapFilterOptionsToSelect,
  parseMonthFilter,
  parseYearFilter,
  toMonthFilterValue,
  toYearFilterValue,
  type ProductFilters,
} from "../utils/filter-products";

type ProductsFiltersProps = {
  filters: ProductFilters;
  filterOptions: ProductFilterOptions;
  onChange: (filters: ProductFilters) => void;
};

export function ProductsFilters({
  filters,
  filterOptions,
  onChange,
}: ProductsFiltersProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const paymentOptions = filterOptions.payments;
  const monthOptions = mapFilterOptionsToSelect(filterOptions.months);
  const yearOptions = mapFilterOptionsToSelect(filterOptions.years);

  return (
    <View style={styles.card}>
      <View style={styles.searchWrap}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          value={filters.customerName}
          onChangeText={(customerName) =>
            onChange({
              ...filters,
              customerName,
            })
          }
          placeholder="Buscar cliente"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.searchWrap}>
        <Gem size={16} color={colors.textSecondary} />
        <TextInput
          value={filters.jewelryName}
          onChangeText={(jewelryName) =>
            onChange({
              ...filters,
              jewelryName,
            })
          }
          placeholder="Buscar joia"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="sentences"
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <SelectField
            compact
            label="Pagamento"
            icon={CircleDollarSign}
            value={filters.payment}
            options={paymentOptions}
            onChange={(payment) =>
              onChange({
                ...filters,
                payment: payment as ProductFilters["payment"],
              })
            }
          />
        </View>

        <View style={styles.gridItem}>
          <SelectField
            compact
            label="Mês"
            icon={CalendarDays}
            value={toMonthFilterValue(filters.month)}
            options={monthOptions}
            onChange={(value) =>
              onChange({
                ...filters,
                month: parseMonthFilter(value),
              })
            }
          />
        </View>

        <View style={styles.gridItem}>
          <SelectField
            compact
            label="Ano"
            icon={CalendarDays}
            value={toYearFilterValue(filters.year)}
            options={yearOptions}
            onChange={(value) =>
              onChange({
                ...filters,
                year: parseYearFilter(value),
                month: null,
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 10,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    searchWrap: {
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
    searchInput: {
      flex: 1,
      height: "100%",
      fontSize: 14,
      color: colors.text,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    gridItem: {
      width: "48%",
      flexGrow: 1,
      minWidth: "46%",
    },
  });
