// Due dates are calendar dates, not instants. They're stored as UTC midnight
// (native behavior of `new Date("YYYY-MM-DD")`), so every read must also use
// UTC getters — otherwise a viewer west of UTC sees the day before.

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const dueDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDueDate(date: Date): string {
  return dueDateFormatter.format(date);
}

export function isOverdue(date: Date, completed: boolean): boolean {
  if (completed) return false;
  return toDateInputValue(date) < toDateInputValue(new Date());
}
