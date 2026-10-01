export const DEFAULT_SAME_DAY_SURCHARGE = 500;

export function parseSameDaySurcharge(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount >= 0 && amount <= 100000 ? amount : null;
}

export function getSameDaySurcharge(value) {
  return parseSameDaySurcharge(value) ?? DEFAULT_SAME_DAY_SURCHARGE;
}
