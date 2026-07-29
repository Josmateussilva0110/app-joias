import { CustomerResponse } from "@app/shared";
import { filterCustomersByName } from "./filter-customers";

export const CUSTOMER_SELECT_INITIAL_LIMIT = 6;

export type CustomerSelectOption = {
  value: string;
  label: string;
};

export function buildCustomerSelectOptions(
  customers: CustomerResponse[],
  searchName: string,
  selectedCustomerId?: string,
  limit = CUSTOMER_SELECT_INITIAL_LIMIT
) {
  const filtered = filterCustomersByName(customers, searchName);
  const isSearching = searchName.trim().length > 0;

  let options: CustomerSelectOption[] = filtered.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  if (!isSearching) {
    options = options.slice(0, limit);
  }

  if (
    selectedCustomerId &&
    !options.some((option) => option.value === selectedCustomerId)
  ) {
    const selectedCustomer = customers.find(
      (customer) => customer.id === selectedCustomerId
    );

    if (selectedCustomer) {
      options = [
        { value: selectedCustomer.id, label: selectedCustomer.name },
        ...options,
      ];
    }
  }

  return {
    options,
    totalCount: customers.length,
    filteredCount: filtered.length,
    isSearching,
    limit,
  };
}
