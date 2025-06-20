export function isValidTime(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
  return regex.test(time);
}
