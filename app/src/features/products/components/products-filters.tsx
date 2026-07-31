import { StyleSheet, View } from "react-native";
import { Gem } from "lucide-react-native";
import { ProductFilterOptions } from "@app/shared";
import { FilterChip, FilterChipRow } from "@/components/ui/filter-chip-row";
import { SearchBar } from "@/components/ui/search-bar";
import { useListLayout } from "@/hooks/use-list-layout";
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
  const { isTablet } = useListLayout();
  const paymentOptions = filterOptions.payments;
  const monthOptions = mapFilterOptionsToSelect(filterOptions.months);
  const yearOptions = mapFilterOptionsToSelect(filterOptions.years);

  return (
    <View style={styles.container}>
      <View style={[styles.searchRow, isTablet && styles.searchRowTablet]}>
        <SearchBar
          value={filters.customerName}
          onChange={(customerName) => onChange({ ...filters, customerName })}
          placeholder="Buscar cliente"
        />
        <SearchBar
          value={filters.jewelryName}
          onChange={(jewelryName) => onChange({ ...filters, jewelryName })}
          placeholder="Buscar joia"
          icon={Gem}
          autoCapitalize="sentences"
        />
      </View>

      <FilterChipRow>
        <FilterChip
          label="Pagamento"
          value={filters.payment}
          options={paymentOptions}
          onChange={(payment) =>
            onChange({ ...filters, payment: payment as ProductFilters["payment"] })
          }
          active={filters.payment !== "all"}
        />

        <FilterChip
          label="Mês"
          value={toMonthFilterValue(filters.month)}
          options={monthOptions}
          onChange={(value) =>
            onChange({ ...filters, month: parseMonthFilter(value) })
          }
          active={filters.month !== null}
        />

        <FilterChip
          label="Ano"
          value={toYearFilterValue(filters.year)}
          options={yearOptions}
          onChange={(value) =>
            onChange({
              ...filters,
              year: parseYearFilter(value),
              month: null,
            })
          }
          active={filters.year !== null}
        />
      </FilterChipRow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  searchRow: {
    gap: 8,
  },
  searchRowTablet: {
    flexDirection: "row",
  },
});
