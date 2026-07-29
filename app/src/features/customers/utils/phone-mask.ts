import { stripPhoneDigits } from "@app/shared";

export { stripPhoneDigits, isValidBrazilianPhone } from "@app/shared";

export function formatPhoneInput(value: string) {
  const digits = stripPhoneDigits(value).slice(0, 11);

  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const isMobile = rest.startsWith("9") || digits.length > 10;

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (isMobile) {
    if (digits.length <= 7) {
      return `(${ddd}) ${rest}`;
    }

    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }

  if (digits.length <= 6) {
    return `(${ddd}) ${rest}`;
  }

  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}

export function formatPhoneDisplay(phone: string) {
  const digits = stripPhoneDigits(phone);

  if (digits.length === 11) {
    return formatPhoneInput(digits);
  }

  if (digits.length === 10) {
    return formatPhoneInput(digits);
  }

  return phone;
}
