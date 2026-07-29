import { CreateCustomerDTO, CustomerResponse } from "@app/shared";
import { CUSTOMER_ROUTES } from "@/config/api-routes";
import { requestData } from "./request";

export function listCustomers() {
  return requestData<CustomerResponse[]>({
    endpoint: CUSTOMER_ROUTES.list,
    method: "GET",
  });
}

export function createCustomer(data: CreateCustomerDTO) {
  return requestData<{ id: string }>({
    endpoint: CUSTOMER_ROUTES.create,
    method: "POST",
    data,
  });
}

export function deleteCustomer(id: string) {
  return requestData({
    endpoint: `${CUSTOMER_ROUTES.list}/${id}`,
    method: "DELETE",
  });
}
