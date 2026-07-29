import { CustomerErrorCode } from "../types/code/customerCode"

export const customerErrorHttpStatusMap: Record<CustomerErrorCode, number> = {
  [CustomerErrorCode.CUSTOMER_NOT_FOUND]: 404,
  [CustomerErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS]: 409,
  [CustomerErrorCode.CUSTOMER_HAS_SALES]: 409,
  [CustomerErrorCode.CUSTOMER_CREATE_FAILED]: 500,
  [CustomerErrorCode.CUSTOMER_FETCH_FAILED]: 500,
  [CustomerErrorCode.CUSTOMER_UPDATE_FAILED]: 500,
  [CustomerErrorCode.CUSTOMER_DELETE_FAILED]: 500,
}
