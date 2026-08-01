import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Platform,
  type KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown, Check, User } from "lucide-react-native";
import { CustomerResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { CustomersSearch } from "@/features/customers/components/customers-search";
import { useCustomerPickerSearch } from "@/hooks/use-customers";

type CustomerSelectFieldProps = {
  customers: CustomerResponse[];
  value: string;
  onChange: (customerId: string) => void;
  error?: string;
  placeholder?: string;
};

export function CustomerSelectField({
  customers,
  value,
  onChange,
  error,
  placeholder = "Selecione um cliente",
}: CustomerSelectFieldProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [keyboardInset, setKeyboardInset] = useState(0);

  const {
    data: searchResult,
    isLoading,
    isFetching,
    isError,
    error: searchError,
    refetch,
  } = useCustomerPickerSearch(searchQuery, open);

  const selectedCustomer =
    customers.find((customer) => customer.id === value) ??
    searchResult?.items.find((customer) => customer.id === value);

  const isSearching = searchQuery.trim().length > 0;

  const options = useMemo(() => {
    const items = searchResult?.items ?? [];
    let mapped = items.map((customer) => ({
      value: customer.id,
      label: customer.name,
    }));

    if (value && !mapped.some((option) => option.value === value) && selectedCustomer) {
      mapped = [
        { value: selectedCustomer.id, label: selectedCustomer.name },
        ...mapped,
      ];
    }

    return mapped;
  }, [searchResult?.items, selectedCustomer, value]);

  const totalCount = searchResult?.total ?? options.length;
  const showLimitHint =
    !isSearching && !isLoading && (searchResult?.has_more ?? totalCount > options.length);

  const selectedLabel = selectedCustomer?.name ?? placeholder;

  function handleClose() {
    Keyboard.dismiss();
    setOpen(false);
    setSearchInput("");
    setSearchQuery("");
  }

  function handleSelect(customerId: string) {
    onChange(customerId);
    handleClose();
  }

  useEffect(() => {
    if (!open) {
      setKeyboardInset(0);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      setKeyboardInset(event.endCoordinates.height);
    };
    const onHide = () => setKeyboardInset(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [open]);

  const sheetBottomPadding = keyboardInset > 0 ? 16 : 16 + insets.bottom;
  const optionsListMaxHeight = keyboardInset > 0 ? 160 : 320;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Cliente*</Text>

      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <User size={16} color={colors.textSecondary} style={styles.icon} />
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
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdropPressable} onPress={handleClose}>
          <Pressable
            style={[
              styles.sheet,
              {
                marginBottom: keyboardInset,
                paddingBottom: sheetBottomPadding,
                maxHeight: keyboardInset > 0 ? "88%" : "70%",
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.sheetTitle}>Selecionar cliente</Text>

            <View style={styles.searchWrap}>
              <CustomersSearch
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={(value) => setSearchQuery(value.trim())}
              />
            </View>

            {isFetching && !isLoading ? (
              <View style={styles.searchStatus}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null}

            {isError ? (
              <View style={styles.searchError}>
                <Text style={styles.searchErrorText}>
                  {searchError?.message ?? "Não foi possível buscar os clientes."}
                </Text>
                <Text onPress={() => refetch()} style={styles.searchErrorRetry}>
                  Tentar novamente
                </Text>
              </View>
            ) : null}

            {showLimitHint ? (
              <Text style={styles.hint}>
                Mostrando {options.length} de {totalCount} clientes. Busque por nome
                para refinar.
              </Text>
            ) : null}

            <ScrollView
              style={[styles.optionsList, { maxHeight: optionsListMaxHeight }]}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isLoading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.emptyDescription}>Carregando clientes...</Text>
                </View>
              ) : options.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
                  <Text style={styles.emptyDescription}>
                    Tente buscar por outro nome.
                  </Text>
                </View>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      activeOpacity={0.7}
                      style={[styles.option, isSelected && styles.optionSelected]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>

                      {isSelected ? <Check size={18} color={colors.primary} /> : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    trigger: {
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 12,
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
      fontSize: 15,
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
    backdropPressable: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    sheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    searchWrap: {
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    searchStatus: {
      alignItems: "center",
      paddingBottom: 8,
    },
    searchError: {
      gap: 4,
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    searchErrorText: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      color: colors.error,
    },
    searchErrorRetry: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      color: colors.primary,
    },
    hint: {
      paddingHorizontal: 24,
      paddingBottom: 8,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary,
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
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      fontWeight: "700",
      color: colors.primary,
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 28,
      gap: 6,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
