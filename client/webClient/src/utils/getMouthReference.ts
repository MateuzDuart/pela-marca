export function getMouthReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() vai de 0 a 11
  return `${year}-${month}`;
}
