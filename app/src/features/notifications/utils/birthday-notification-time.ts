export type BirthdayNotificationTime = {
  hour: number;
  minute: number;
};

export function formatBirthdayNotificationTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function birthdayNotificationTimeToDate(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function dateToBirthdayNotificationTime(date: Date) {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}
