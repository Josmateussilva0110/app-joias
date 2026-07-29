import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChevronDown, Check, User } from "lucide-react-native";
import { CustomerResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { CustomersSearch } from "@/features/customers/components/customers-search";
import { buildCustomerSelectOptions } from "@/features/customers/utils/customer-select-options";

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
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");

  const selectedCustomer = customers.find((customer) => customer.id === value);

  const { options, totalCount, isSearching, limit } = useMemo(
    () => buildCustomerSelectOptions(customers, searchName, value),
    [customers, searchName, value]
  );

  const selectedLabel = selectedCustomer?.name ?? placeholder;
  const showLimitHint = !isSearching && totalCount > limit;

  function handleClose() {
    setOpen(false);
    setSearchName("");
  }

  function handleSelect(customerId: string) {
    onChange(customerId);
    handleClose();
  }

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
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>Selecionar cliente</Text>

            <View style={styles.searchWrap}>
              <CustomersSearch value={searchName} onChange={setSearchName} />
            </View>

            {showLimitHint ? (
              <Text style={styles.hint}>
                Mostrando {options.length} de {totalCount} clientes. Busque por
                nome para ver mais.
              </Text>
            ) : null}

            <ScrollView
              style={styles.optionsList}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {options.length === 0 ? (
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
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    sheet: {
      maxHeight: "70%",
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
      marginBottom: 12,
    },
    searchWrap: {
      paddingHorizontal: 16,
      marginBottom: 8,
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
      maxHeight: 320,
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
