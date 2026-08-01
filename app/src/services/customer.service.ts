import {
  CreateCustomerDTO,
  CustomerListResult,
  CustomerResponse,
  ListCustomersQueryDTO,
  UpdateCustomerDTO,
} from "@app/shared";
import { CUSTOMER_ROUTES } from "@/config/api-routes";
import { requestData } from "./request";

export function listCustomers(params?: ListCustomersQueryDTO) {
  return requestData<CustomerListResult>({
    endpoint: CUSTOMER_ROUTES.list,
    method: "GET",
    params,
  });
}

export function getCustomer(id: string) {
  return requestData<CustomerResponse>({
    endpoint: `${CUSTOMER_ROUTES.list}/${id}`,
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

export function updateCustomer(id: string, data: UpdateCustomerDTO) {
  return requestData<{ id: string }>({
    endpoint: `${CUSTOMER_ROUTES.list}/${id}`,
    method: "PUT",
    data,
  });
}

export function deleteCustomer(id: string) {
  return requestData({
    endpoint: `${CUSTOMER_ROUTES.list}/${id}`,
    method: "DELETE",
  });
}
