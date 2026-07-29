import { CustomerResponse } from "@app/shared";

export function filterCustomersByName(
  customers: CustomerResponse[],
  name: string
) {
  const query = name.trim().toLowerCase();

  if (!query) {
    return customers;
  }

  return customers.filter((customer) =>
    customer.name.toLowerCase().includes(query)
  );
}
