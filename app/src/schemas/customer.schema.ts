import { z } from "zod";
import {
  createCustomerSchema,
  CUSTOMER_PHONE_INVALID_MESSAGE,
  isValidBrazilianPhone,
  type CreateCustomerDTO,
  type CustomerResponse,
  type UpdateCustomerDTO,
} from "@app/shared";
import { formatCustomerBirthDate } from "@/features/customers/constants/customer-labels";
import {
  formatPhoneDisplay,
  stripPhoneDigits,
} from "@/features/customers/utils/phone-mask";

export const customerFormSchema = z.object({
  name: createCustomerSchema.shape.name,
  phone: z
    .string()
    .trim()
    .refine(isValidBrazilianPhone, CUSTOMER_PHONE_INVALID_MESSAGE),
  birth_date: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Informe a data no formato DD/MM/AAAA."),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export function toCustomerFormData(customer: CustomerResponse): CustomerFormData {
  return {
    name: customer.name,
    phone: formatPhoneDisplay(customer.phone),
    birth_date: formatCustomerBirthDate(customer.birth_date),
  };
}

export function toCreateCustomerDTO(data: CustomerFormData): CreateCustomerDTO {
  const [day, month, year] = data.birth_date.split("/");

  return {
    name: data.name,
    phone: stripPhoneDigits(data.phone),
    birth_date: `${year}-${month}-${day}`,
  };
}

export function toUpdateCustomerDTO(data: CustomerFormData): UpdateCustomerDTO {
  return toCreateCustomerDTO(data);
}
