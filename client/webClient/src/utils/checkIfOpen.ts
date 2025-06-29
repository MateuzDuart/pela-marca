export function checkIfOpen(
  eventDate: Date,
  confirmationOpenHoursBeforeEvent: number,
  confirmationCloseHoursFromEvent: number
): boolean {
  const now = new Date();

  const openTime = new Date(eventDate);
  openTime.setHours(eventDate.getHours() - confirmationOpenHoursBeforeEvent);

  const closeTime = new Date(eventDate);
  closeTime.setHours(eventDate.getHours() - confirmationCloseHoursFromEvent);

  return now >= openTime && now <= closeTime;
}
