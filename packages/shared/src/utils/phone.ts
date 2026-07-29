export function stripPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidBrazilianPhone(value: string) {
  const digits = stripPhoneDigits(value);

  if (!/^\d{10,11}$/.test(digits)) {
    return false;
  }

  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  if (digits.length === 11 && digits[2] !== "9") {
    return false;
  }

  return true;
}

export const CUSTOMER_PHONE_INVALID_MESSAGE =
  "Informe um telefone válido com DDD (10 ou 11 dígitos).";
