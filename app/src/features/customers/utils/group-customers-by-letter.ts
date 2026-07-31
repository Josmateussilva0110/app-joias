import type { CustomerResponse } from "@app/shared";

export type CustomerSection = {
  title: string;
  data: CustomerResponse[];
};

function getSortLetter(name: string) {
  const trimmed = name.trim();
  const first = trimmed.charAt(0).toUpperCase();

  return first.match(/[A-ZÀ-ÖØ-Ý]/i) ? first.toUpperCase() : "#";
}

export function groupCustomersByLetter(customers: CustomerResponse[]): CustomerSection[] {
  const sections = new Map<string, CustomerSection>();

  for (const customer of customers) {
    const title = getSortLetter(customer.name);
    const existing = sections.get(title);

    if (existing) {
      existing.data.push(customer);
      continue;
    }

    sections.set(title, { title, data: [customer] });
  }

  return Array.from(sections.entries())
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([, section]) => section);
}
