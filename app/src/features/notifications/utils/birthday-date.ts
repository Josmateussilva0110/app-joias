export function parseBirthDateComponents(birthDate: string) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);

  if (!isoMatch) {
    return null;
  }

  const month = Number(isoMatch[2]);
  const day = Number(isoMatch[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const monthIndex = month - 1;
  const daysInMonth = new Date(2000, monthIndex + 1, 0).getDate();

  if (day > daysInMonth) {
    return null;
  }

  return {
    month: monthIndex,
    day,
  };
}
