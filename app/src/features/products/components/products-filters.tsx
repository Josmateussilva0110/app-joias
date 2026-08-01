import { useEffect, useRef, useState } from "react";
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

  const [customerDraft, setCustomerDraft] = useState(filters.customerName);
  const [jewelryDraft, setJewelryDraft] = useState(filters.jewelryName);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    setCustomerDraft(filters.customerName);
    setJewelryDraft(filters.jewelryName);
  }, [filters.customerName, filters.jewelryName]);

  const submitCustomerSearch = (value: string = customerDraft) => {
    onChange({
      ...filtersRef.current,
      customerName: value,
    });
  };

  const submitJewelrySearch = (value: string = jewelryDraft) => {
    onChange({
      ...filtersRef.current,
      jewelryName: value,
    });
  };

  const pushChipFilters = (next: Partial<ProductFilters>) => {
    onChange({
      ...filtersRef.current,
      customerName: customerDraft,
      jewelryName: jewelryDraft,
      ...next,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchRow, isTablet && styles.searchRowTablet]}>
        <SearchBar
          style={isTablet ? styles.searchField : undefined}
          value={customerDraft}
          onChange={setCustomerDraft}
          onSubmit={submitCustomerSearch}
          placeholder="Buscar cliente"
        />
        <SearchBar
          style={isTablet ? styles.searchField : undefined}
          value={jewelryDraft}
          onChange={setJewelryDraft}
          onSubmit={submitJewelrySearch}
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
            pushChipFilters({
              payment: payment as ProductFilters["payment"],
            })
          }
          active={filters.payment !== "all"}
        />

        <FilterChip
          label="Mês"
          value={toMonthFilterValue(filters.month)}
          options={monthOptions}
          onChange={(value) =>
            pushChipFilters({ month: parseMonthFilter(value) })
          }
          active={filters.month !== null}
        />

        <FilterChip
          label="Ano"
          value={toYearFilterValue(filters.year)}
          options={yearOptions}
          onChange={(value) =>
            pushChipFilters({
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
  searchField: {
    flex: 1,
  },
});
