export function formatHour(time: string): string {
  const [hour, minute] = time.split(":");
  return `${hour}:${minute}`;
}
